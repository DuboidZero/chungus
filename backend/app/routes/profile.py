from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.profile import Profile
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.core.dependencies import get_current_user, get_db

router = APIRouter(prefix="/me/profile", tags=["profile"])


def _get_or_create_profile(db: Session, user: User) -> Profile:
    """Return the user's profile, creating an empty one if it doesn't exist yet."""
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile is None:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_or_create_profile(db, current_user)


@router.patch("", response_model=ProfileResponse)
def update_my_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = _get_or_create_profile(db, current_user)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile