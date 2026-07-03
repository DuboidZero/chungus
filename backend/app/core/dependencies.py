from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.core.security import decode_access_token


# Tells FastAPI to look for the token in the "Authorization: Bearer <token>" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


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

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Like get_current_user, but also requires the admin role.
    Protects all /admin endpoints — students/teachers get 403."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

def assert_mentors_student(db, teacher_id: str, student_id: str):
    """Raise 403 if the teacher is not the mentor of this student."""
    from app.models.mentor import MentorAssignment
    link = db.query(MentorAssignment).filter(
        MentorAssignment.teacher_id == teacher_id,
        MentorAssignment.student_id == student_id,
    ).first()
    if link is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assigned student")

def get_current_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Requires the teacher role. Protects all /teacher endpoints."""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required",
        )
    return current_user