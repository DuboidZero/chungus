from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse, ChangePasswordRequest, RefreshRequest, TokenPairResponse
from app.core.security import verify_password, create_access_token, create_refresh_token, hash_password, decode_access_token
from app.core.dependencies import get_current_user, get_db

router = APIRouter(prefix="/auth", tags=["auth"])

# Separate router with NO /auth prefix — for the contract's GET /me
me_router = APIRouter(tags=["user"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # 1. Look up the user by PRN or email (frontend sends "identifier")
    user = db.query(User).filter(or_(User.prn == payload.identifier, User.email == payload.identifier)).first()

    # 2. If no user, or password is wrong -> reject (same message for both, on purpose)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # 3. Make sure the account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # 4. Mint a token carrying the user's id and role
    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.id, "role": user.role})
    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "first_login": user.must_change_password,
    }


# Contract path: GET /me
@me_router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.profile import Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "prn": current_user.prn,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "avatar": profile.avatar if profile else None,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }


# Kept for backwards-compat: GET /auth/me
@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.profile import Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "prn": current_user.prn,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "avatar": profile.avatar if profile else None,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }

@router.post("/token", include_in_schema=False)
def login_for_docs(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Helper endpoint so the /docs 'Authorize' button works. Not for the frontend."""
    user = db.query(User).filter(or_(User.prn == form_data.username, User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Verify the current password is correct
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # 2. Basic rule: new password must be at least 8 characters (SRS 3.2)
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters",
        )

    # 3. Hash and save the new password, clear the must-change flag
    current_user.hashed_password = hash_password(payload.new_password)
    current_user.must_change_password = False
    db.commit()

    return {"detail": "Password changed successfully"}


@router.post("/refresh", response_model=TokenPairResponse)
def refresh_token(payload: RefreshRequest):
    data = decode_access_token(payload.refresh_token)
    if data is None or data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    new_access = create_access_token({"sub": data["sub"], "role": data["role"]})
    new_refresh = create_refresh_token({"sub": data["sub"], "role": data["role"]})
    return {"access_token": new_access, "refresh_token": new_refresh}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout():
    # Stateless JWT: the client discards the tokens. Server-side revocation is a future step.
    return