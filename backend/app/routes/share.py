import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.skill import TechnicalSkill, SoftSkill, Language
from app.models.project import Project
from app.models.achievement import Achievement
from app.models.experience import Experience
from app.core.marks_engine import compute_student_cgpa

router = APIRouter(prefix="/share", tags=["share-portfolio"])


# ============================================================
#  STUDENT — manage their share link
# ============================================================
@router.post("/generate", response_model=dict)
async def generate_share_link(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Create (or regenerate) a random share token and enable sharing."""
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    current.share_token = secrets.token_urlsafe(32)
    current.share_enabled = True
    db.commit()
    return {"shareToken": current.share_token, "shareEnabled": True,
            "shareUrl": f"/public/portfolio/{current.share_token}"}


@router.post("/disable", response_model=dict)
async def disable_share_link(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Turn off sharing (link stops working, token kept so it can be re-enabled)."""
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    current.share_enabled = False
    db.commit()
    return {"shareEnabled": False}


@router.get("/status", response_model=dict)
async def share_status(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    return {
        "shareEnabled": current.share_enabled,
        "shareToken": current.share_token,
        "shareUrl": f"/public/portfolio/{current.share_token}" if current.share_token else None,
    }


@router.patch("/visibility/{item_type}/{item_id}", response_model=dict)
async def toggle_visibility(
    item_type: str,
    item_id: str,
    is_public: bool,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Mark one project/achievement/experience public or private."""
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    model = {"project": Project, "achievement": Achievement, "experience": Experience}.get(item_type)
    if model is None:
        raise HTTPException(status_code=400, detail="item_type must be project, achievement, or experience")
    item = db.query(model).filter(model.id == item_id, model.user_id == current.id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found or not yours")
    item.is_public = is_public
    db.commit()
    return {"itemType": item_type, "itemId": item_id, "isPublic": is_public}


# ============================================================
#  PUBLIC — view a portfolio by token (NO AUTH)
# ============================================================
@router.get("/public/portfolio/{token}", response_model=dict)
async def public_portfolio(token: str, db: Session = Depends(get_db)):
    """Public, read-only, redacted portfolio. No login needed.
    Only shows if sharing enabled. Marks redacted (CGPA only).
    Only is_public=True items included."""
    student = db.query(User).filter(
        User.share_token == token, User.role == "student"
    ).first()
    if student is None or not student.share_enabled:
        raise HTTPException(status_code=404, detail="Portfolio not found or sharing is disabled")

    profile = db.query(Profile).filter(Profile.user_id == student.id).first()
    tech = db.query(TechnicalSkill).filter(TechnicalSkill.user_id == student.id).all()
    soft = db.query(SoftSkill).filter(SoftSkill.user_id == student.id).all()
    langs = db.query(Language).filter(Language.user_id == student.id).all()
    projects = db.query(Project).filter(Project.user_id == student.id, Project.is_public == True).all()
    achievements = db.query(Achievement).filter(Achievement.user_id == student.id, Achievement.is_public == True).all()
    experiences = db.query(Experience).filter(Experience.user_id == student.id, Experience.is_public == True).all()

    academics = compute_student_cgpa(db, student.id)

    return {
        "name": student.name,
        "cgpa": academics["cgpa"],
        "about": profile.about if profile and hasattr(profile, "about") else None,
        "skills": {
            "technical": [{"name": s.name, "proficiency": s.proficiency} for s in tech],
            "soft": [{"name": s.name} for s in soft],
            "languages": [{"name": s.name, "proficiency": s.proficiency} for s in langs],
        },
        "projects": [{
            "name": p.name, "description": p.description, "domain": p.domain,
            "techStack": p.tech_stack, "type": p.type, "status": p.status,
            "imageUrl": p.image_url, "githubRepo": p.github_repo,
        } for p in projects],
        "achievements": [{
            "title": a.title, "description": a.description, "category": a.category,
            "type": a.type, "level": a.level, "certificateUrl": a.certificate_url,
        } for a in achievements],
        "experiences": [{
            "organisation": e.organisation_name, "role": e.role, "type": e.type,
            "description": e.description,
        } for e in experiences],
    }