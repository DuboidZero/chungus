from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.achievement import Achievement
from app.schemas.achievement import AchievementCreate, AchievementUpdate, AchievementResponse
from app.core.dependencies import get_current_user, get_db

router = APIRouter(prefix="/me/achievements", tags=["achievements"])


@router.get("", response_model=list[AchievementResponse])
def list_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Achievement).filter(Achievement.user_id == current_user.id).all()


@router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(
    payload: AchievementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    achievement = Achievement(user_id=current_user.id, **payload.model_dump())
    db.add(achievement)
    db.commit()
    db.refresh(achievement)
    return achievement


@router.patch("/{achievement_id}", response_model=AchievementResponse)
def update_achievement(
    achievement_id: str,
    payload: AchievementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    achievement = db.query(Achievement).filter(
        Achievement.id == achievement_id,
        Achievement.user_id == current_user.id,
    ).first()
    if achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(achievement, field, value)
    db.commit()
    db.refresh(achievement)
    return achievement


@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    achievement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    achievement = db.query(Achievement).filter(
        Achievement.id == achievement_id,
        Achievement.user_id == current_user.id,
    ).first()
    if achievement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")

    db.delete(achievement)
    db.commit()