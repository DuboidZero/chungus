from datetime import date as _date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.teacher_records import GuidanceCase
from app.schemas.teacher import GuidanceCaseCreate, GuidanceCaseUpdate, GuidanceCaseResponse
from app.core.dependencies import get_current_teacher, get_db, assert_mentors_student

router = APIRouter()


@router.post("/guidance-cases", response_model=GuidanceCaseResponse, status_code=status.HTTP_201_CREATED)
def open_guidance_case(payload: GuidanceCaseCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, payload.student_id)
    case = GuidanceCase(student_id=payload.student_id, owning_teacher_id=teacher.id,
        trigger_signal=payload.trigger_signal, status="Open", date_opened=_date.today())
    db.add(case); db.commit(); db.refresh(case)
    return case


@router.patch("/guidance-cases/{case_id}", response_model=GuidanceCaseResponse)
def update_guidance_case(case_id: str, payload: GuidanceCaseUpdate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    case = db.query(GuidanceCase).filter(GuidanceCase.id == case_id).first()
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guidance case not found")
    assert_mentors_student(db, teacher.id, case.student_id)
    if payload.status is not None:
        case.status = payload.status
        if payload.status == "Resolved":
            case.date_resolved = _date.today()
    if payload.resolution_note is not None:
        case.resolution_note = payload.resolution_note
    db.commit(); db.refresh(case)
    return case