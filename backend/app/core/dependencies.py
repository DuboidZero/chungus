from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.core.security import decode_access_token


# Tells FastAPI to look for the token in the "Authorization: Bearer <token>" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Decode the token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_error

    # 2. Pull the user id out of the token (we stored it as "sub")
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_error

    # 3. Look the user up in the database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_error

    # 4. Make sure the account is still active
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    return user