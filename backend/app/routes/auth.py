from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


# Dependency: gives each request its own DB session, and closes it after
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
    return {"user": user, "accessToken": access_token}