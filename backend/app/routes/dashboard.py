from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.project import Project
from app.models.achievement import Achievement
from app.models.skill import TechnicalSkill, SoftSkill, Language
from app.models.academic import Semester, Subject
from app.core.dependencies import get_current_user, get_db
from app.core.grading import calculate_cgpa, calculate_sgpa

router = APIRouter(prefix="/me/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    uid = current_user.id

    # --- Counts ---
    project_count = db.query(Project).filter(Project.user_id == uid).count()
    achievement_count = db.query(Achievement).filter(Achievement.user_id == uid).count()
    skill_count = (
        db.query(TechnicalSkill).filter(TechnicalSkill.user_id == uid).count()
        + db.query(SoftSkill).filter(SoftSkill.user_id == uid).count()
        + db.query(Language).filter(Language.user_id == uid).count()
    )

    # --- CGPA + per-semester trend ---
    semesters = db.query(Semester).filter(Semester.user_id == uid).order_by(Semester.semester_number).all()

    all_subjects = []
    cgpa_trend = []
    for sem in semesters:
        subs = db.query(Subject).filter(Subject.semester_id == sem.id).all()
        all_subjects.extend(subs)
        cgpa_trend.append({
            "semester": f"Sem {sem.semester_number}",
            "cgpa": calculate_sgpa(subs),
        })

    overall_cgpa = calculate_cgpa(all_subjects)

    return {
        "stats": {
            "cgpa": overall_cgpa,
            "projectCount": project_count,
            "achievementCount": achievement_count,
            "skillCount": skill_count,
        },
        "cgpaTrend": cgpa_trend,
        "upcomingDeadlines": [],
    }