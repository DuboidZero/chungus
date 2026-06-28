from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.skill import TechnicalSkill, SoftSkill, Language
from app.schemas.skill import (
    TechnicalSkillCreate, TechnicalSkillResponse,
    SoftSkillCreate, SoftSkillResponse,
    LanguageCreate, LanguageResponse,
    SkillsResponse,
)
from app.core.dependencies import get_current_user, get_db

router = APIRouter(prefix="/me/skills", tags=["skills"])


# --- GET all three groups together ---
@router.get("", response_model=SkillsResponse)
def get_skills(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    technical = db.query(TechnicalSkill).filter(TechnicalSkill.user_id == current_user.id).all()
    soft = db.query(SoftSkill).filter(SoftSkill.user_id == current_user.id).all()
    languages = db.query(Language).filter(Language.user_id == current_user.id).all()
    return {"technical": technical, "soft": soft, "languages": languages}


# --- POST: add a technical skill ---
@router.post("/technical", response_model=TechnicalSkillResponse, status_code=status.HTTP_201_CREATED)
def add_technical(payload: TechnicalSkillCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = TechnicalSkill(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# --- POST: add a soft skill ---
@router.post("/soft", response_model=SoftSkillResponse, status_code=status.HTTP_201_CREATED)
def add_soft(payload: SoftSkillCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = SoftSkill(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# --- POST: add a language ---
@router.post("/languages", response_model=LanguageResponse, status_code=status.HTTP_201_CREATED)
def add_language(payload: LanguageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = Language(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# --- DELETE: remove a skill by type + id ---
@router.delete("/{skill_type}/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_type: str, skill_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Map the URL type to the right table
    models = {"technical": TechnicalSkill, "soft": SoftSkill, "languages": Language}
    model = models.get(skill_type)
    if model is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid skill type")

    item = db.query(model).filter(model.id == skill_id, model.user_id == current_user.id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    db.delete(item)
    db.commit()