from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_current_admin, get_db
from app.models.user import User
from app.models.academic_structure import Course
from app.models.mentorship import SubjectTeacher
from app.core.analytics_engine import (
    cohort_distribution_for_course, at_risk_students_for_course,
    student_performance, class_grade_distribution,
    component_comparison, domain_radar,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _teacher_can_see_course(db: Session, teacher_id: str, course_id: str) -> bool:
    return db.query(SubjectTeacher).filter(
        SubjectTeacher.teacher_id == teacher_id,
        SubjectTeacher.course_id == course_id,
    ).first() is not None


# ============================================================
#  COURSE-LEVEL (admin, or the subject teacher of that course)
# ============================================================
@router.get("/course/{course_id}/distribution")
async def course_distribution(
    course_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if current.role == "teacher" and not _teacher_can_see_course(db, current.id, course_id):
        raise HTTPException(status_code=403, detail="You don't teach this course")
    if current.role == "student":
        raise HTTPException(status_code=403, detail="Not available for students")
    return cohort_distribution_for_course(db, course)


@router.get("/course/{course_id}/at-risk")
async def course_at_risk(
    course_id: str,
    threshold: float = 40.0,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if current.role == "teacher" and not _teacher_can_see_course(db, current.id, course_id):
        raise HTTPException(status_code=403, detail="You don't teach this course")
    if current.role == "student":
        raise HTTPException(status_code=403, detail="Not available for students")
    return at_risk_students_for_course(db, course, threshold)


@router.get("/course/{course_id}/grade-distribution")
async def course_grade_distribution(
    course_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if current.role == "teacher" and not _teacher_can_see_course(db, current.id, course_id):
        raise HTTPException(status_code=403, detail="You don't teach this course")
    if current.role == "student":
        raise HTTPException(status_code=403, detail="Not available for students")
    return class_grade_distribution(db, course)


# ============================================================
#  STUDENT-LEVEL (the student themselves, their mentor, or admin)
# ============================================================
@router.get("/student/{student_id}/performance")
async def student_perf(
    student_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    allowed = (
        current.id == student_id
        or current.role == "admin"
        or (current.role == "teacher" and student.mentor_id == current.id)
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed to view this student's analytics")
    return student_performance(db, student_id)


@router.get("/me/performance")
async def my_performance(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    return student_performance(db, current.id)


@router.get("/student/{student_id}/course/{course_id}/components")
async def student_component_comparison(
    student_id: str,
    course_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    allowed = (
        current.id == student_id or current.role == "admin"
        or (current.role == "teacher" and student.mentor_id == current.id)
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed")
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return component_comparison(db, student_id, course)


@router.get("/student/{student_id}/domain-radar")
async def student_domain_radar(
    student_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    allowed = (
        current.id == student_id or current.role == "admin"
        or (current.role == "teacher" and student.mentor_id == current.id)
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed")
    return domain_radar(db, student_id)