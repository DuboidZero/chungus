from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.experience import Experience
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.core.dependencies import get_current_user, get_db

router = APIRouter(prefix="/me/experience", tags=["experience"])


@router.get("", response_model=list[ExperienceResponse])
def list_experience(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Experience).filter(Experience.user_id == current_user.id).all()


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(payload: ExperienceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = Experience(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{experience_id}", response_model=ExperienceResponse)
def update_experience(experience_id: str, payload: ExperienceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Experience).filter(Experience.id == experience_id, Experience.user_id == current_user.id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(experience_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Experience).filter(Experience.id == experience_id, Experience.user_id == current_user.id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
    db.delete(item)
    db.commit()