from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.academic import Semester, Subject
from app.schemas.academic import SemesterCreate, SemesterUpdate, SemesterResponse
from app.core.dependencies import get_current_user, get_db
from app.core.grading import calculate_sgpa

router = APIRouter(prefix="/me/academic-records", tags=["academic"])


def _build_semester_response(semester: Semester) -> dict:
    """Shape a semester with its computed gpa + total_credits + subjects."""
    subjects = semester.subjects
    return {
        "id": semester.id,
        "semester_number": semester.semester_number,
        "gpa": calculate_sgpa(subjects),
        "total_credits": sum(s.credits for s in subjects),
        "subjects": subjects,
        "created_at": semester.created_at,
        "updated_at": semester.updated_at,
    }


@router.get("", response_model=list[SemesterResponse])
def list_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    semesters = db.query(Semester).filter(Semester.user_id == current_user.id).all()
    return [_build_semester_response(s) for s in semesters]


@router.post("", response_model=SemesterResponse, status_code=status.HTTP_201_CREATED)
def create_record(payload: SemesterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    semester = Semester(user_id=current_user.id, semester_number=payload.semester_number)
    db.add(semester)
    db.flush()  # get semester.id before adding subjects

    for subj in payload.subjects:
        db.add(Subject(semester_id=semester.id, **subj.model_dump()))

    db.commit()
    db.refresh(semester)
    return _build_semester_response(semester)


@router.patch("/{semester_id}", response_model=SemesterResponse)
def update_record(
    semester_id: str,
    payload: SemesterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    semester = db.query(Semester).filter(
        Semester.id == semester_id,
        Semester.user_id == current_user.id,
    ).first()
    if semester is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Semester not found")

    # Update semester number if provided
    if payload.semester_number is not None:
        semester.semester_number = payload.semester_number

    # If subjects provided, replace the whole set
    if payload.subjects is not None:
        db.query(Subject).filter(Subject.semester_id == semester.id).delete()
        for subj in payload.subjects:
            db.add(Subject(semester_id=semester.id, **subj.model_dump()))

    db.commit()
    db.refresh(semester)
    return _build_semester_response(semester)


@router.delete("/{semester_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(semester_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    semester = db.query(Semester).filter(Semester.id == semester_id, Semester.user_id == current_user.id).first()
    if semester is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Semester not found")
    db.query(Subject).filter(Subject.semester_id == semester_id).delete()
    db.delete(semester)
    db.commit()