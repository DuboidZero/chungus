from sqlalchemy.orm import Session
from app.models.academic import Semester, Subject
from app.models.teacher_records import PrivateNote, AssessmentMark
from app.core.grading import calculate_cgpa


def student_cgpa(db: Session, student_id: str) -> float:
    semesters = db.query(Semester).filter(Semester.user_id == student_id).all()
    all_subjects = []
    for sem in semesters:
        all_subjects.extend(db.query(Subject).filter(Subject.semester_id == sem.id).all())
    return calculate_cgpa(all_subjects)


def performance_tier(cgpa: float) -> str:
    if cgpa >= 7.75:
        return "High Performing"
    if cgpa >= 5.0:
        return "Average - Guidable"
    return "Underperforming"


def note_out(note: PrivateNote, teacher_name: str | None) -> dict:
    return {
        "id": note.id, "student_id": note.student_id, "teacher_id": note.teacher_id,
        "teacher_name": teacher_name, "content": note.content,
        "created_at": note.created_at, "updated_at": note.updated_at,
    }


def mark_out(mark: AssessmentMark, teacher_name: str | None) -> dict:
    return {
        "id": mark.id, "student_id": mark.student_id, "project_id": mark.project_id,
        "assessment_title": mark.assessment_title, "score": mark.score,
        "max_score": mark.max_score, "comments": mark.comments,
        "teacher_id": mark.teacher_id, "teacher_name": teacher_name, "date": mark.date,
        "created_at": mark.created_at, "updated_at": mark.updated_at,
    }