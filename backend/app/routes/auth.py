from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse, ChangePasswordRequest
from app.core.security import verify_password, create_access_token, hash_password
from app.core.dependencies import get_current_user, get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # 1. Look up the user by PRN
    user = db.query(User).filter(User.prn == payload.prn).first()

    # 2. If no user, or password is wrong -> reject (same message for both, on purpose)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PRN or password",
        )

    # 3. Make sure the account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # 4. Mint a token carrying the user's id and role
    access_token = create_access_token({"sub": user.id, "role": user.role})

    # 5. Return the user + token (FastAPI shapes it via LoginResponse)
    return {
        "user": user,
        "access_token": access_token,
        "must_change_password": user.must_change_password,
    }


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/token", include_in_schema=False)
def login_for_docs(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Helper endpoint so the /docs 'Authorize' button works. Not for the frontend."""
    user = db.query(User).filter(User.prn == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid PRN or password")
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