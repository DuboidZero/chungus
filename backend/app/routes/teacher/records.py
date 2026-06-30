from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.project import Project
from app.models.teacher_records import PrivateNote, AssessmentMark, ProjectMilestone
from app.schemas.teacher import (
    NoteCreate, NoteUpdate, NoteResponse,
    MarkCreate, MarkResponse,
    MilestoneCreate, MilestoneResponse,
)
from app.core.dependencies import get_current_teacher, get_db, assert_mentors_student
from app.core.teacher_helpers import note_out, mark_out

router = APIRouter()


# --- Notes ---
@router.post("/students/{student_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def add_note(student_id: str, payload: NoteCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    note = PrivateNote(teacher_id=teacher.id, student_id=student_id, content=payload.content)
    db.add(note); db.commit(); db.refresh(note)
    return note_out(note, teacher.name)


@router.patch("/students/{student_id}/notes/{note_id}", response_model=NoteResponse)
def edit_note(student_id: str, note_id: str, payload: NoteUpdate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    note = db.query(PrivateNote).filter(PrivateNote.id == note_id, PrivateNote.student_id == student_id).first()
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.teacher_id != teacher.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author can edit this note")
    note.content = payload.content
    db.commit(); db.refresh(note)
    return note_out(note, teacher.name)


@router.delete("/students/{student_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(student_id: str, note_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    note = db.query(PrivateNote).filter(PrivateNote.id == note_id, PrivateNote.student_id == student_id).first()
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.teacher_id != teacher.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author can delete this note")
    db.delete(note); db.commit()


# --- Marks ---
@router.post("/students/{student_id}/marks", response_model=MarkResponse, status_code=status.HTTP_201_CREATED)
def add_student_mark(student_id: str, payload: MarkCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    mark = AssessmentMark(teacher_id=teacher.id, student_id=student_id, project_id=None,
        assessment_title=payload.assessment_title, score=payload.score,
        max_score=payload.max_score, comments=payload.comments, date=payload.date)
    db.add(mark); db.commit(); db.refresh(mark)
    return mark_out(mark, teacher.name)


@router.get("/students/{student_id}/marks", response_model=list[MarkResponse])
def get_student_marks(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    marks = db.query(AssessmentMark).filter(AssessmentMark.student_id == student_id).all()
    return [mark_out(m, teacher.name) for m in marks]


@router.get("/marks", response_model=list[MarkResponse])
def get_my_marks(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    marks = db.query(AssessmentMark).filter(AssessmentMark.teacher_id == teacher.id).all()
    return [mark_out(m, teacher.name) for m in marks]


@router.post("/projects/{project_id}/marks", response_model=MarkResponse, status_code=status.HTTP_201_CREATED)
def add_project_mark(project_id: str, payload: MarkCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    assert_mentors_student(db, teacher.id, project.user_id)
    mark = AssessmentMark(teacher_id=teacher.id, student_id=project.user_id, project_id=project_id,
        assessment_title=payload.assessment_title, score=payload.score,
        max_score=payload.max_score, comments=payload.comments, date=payload.date)
    db.add(mark); db.commit(); db.refresh(mark)
    return mark_out(mark, teacher.name)


@router.get("/projects/{project_id}/marks", response_model=list[MarkResponse])
def get_project_marks(project_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    marks = db.query(AssessmentMark).filter(AssessmentMark.project_id == project_id).all()
    return [mark_out(m, teacher.name) for m in marks]


# --- Milestones ---
@router.post("/projects/{project_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def add_milestone(project_id: str, payload: MilestoneCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    assert_mentors_student(db, teacher.id, project.user_id)
    milestone = ProjectMilestone(project_id=project_id, description=payload.description,
        status=payload.status.value, date=payload.date)
    db.add(milestone); db.commit(); db.refresh(milestone)
    return milestone


@router.get("/projects/{project_id}/milestones", response_model=list[MilestoneResponse])
def get_milestones(project_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    return db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()

@router.get("/students/{student_id}/notes", response_model=list[NoteResponse])
def get_student_notes(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    notes = db.query(PrivateNote).filter(PrivateNote.student_id == student_id).all()
    return [note_out(n, teacher.name) for n in notes]