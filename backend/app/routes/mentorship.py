from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.dependencies import get_current_admin, get_current_user, get_db
from app.models.user import User
from app.models.academic_structure import Branch, Division, Course
from app.models.mentorship import SubjectTeacher
from app.schemas.mentorship import (
    TeacherBranchAssign, SubjectTeacherCreate, SubjectTeacherResponse,
    MentorChoose, TeacherBrief,
)

# --- Phase 3 view endpoints ---
from app.core.marks_engine import compute_student_cgpa
from app.models.teacher_records import PrivateNote
from app.models.skill import TechnicalSkill, SoftSkill, Language
from app.models.project import Project
from app.models.achievement import Achievement
from app.models.experience import Experience
from app.models.profile import Profile

router = APIRouter(prefix="/mentorship", tags=["mentorship"])


# ============================================================
#  ADMIN — assign a teacher's branch
# ============================================================
@router.patch("/admin/teachers/{teacher_id}/branch", response_model=dict)
async def assign_teacher_branch(
    teacher_id: str,
    payload: TeacherBranchAssign,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    if not db.query(Branch).filter(Branch.id == payload.branch_id).first():
        raise HTTPException(status_code=404, detail="Branch not found")
    teacher.branch_id = payload.branch_id
    db.commit()
    return {"teacherId": teacher.id, "branchId": teacher.branch_id}


# ============================================================
#  ADMIN — subject-teacher assignment (Teacher teaches Course to Division)
# ============================================================
@router.post("/admin/subject-teachers", response_model=SubjectTeacherResponse, status_code=201)
async def assign_subject_teacher(
    payload: SubjectTeacherCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    teacher = db.query(User).filter(User.id == payload.teacher_id, User.role == "teacher").first()
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    division = db.query(Division).filter(Division.id == payload.division_id).first()
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")

    st = SubjectTeacher(teacher_id=payload.teacher_id, course_id=payload.course_id,
                        division_id=payload.division_id)
    db.add(st)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="That teacher is already assigned to this course + division")
    db.refresh(st)
    return {
        "id": st.id,
        "teacher_id": teacher.id, "teacher_name": teacher.name,
        "course_id": course.id, "course_code": course.course_code, "course_name": course.course_name,
        "division_id": division.id, "division_name": division.name,
    }


@router.get("/admin/subject-teachers", response_model=list[SubjectTeacherResponse])
async def list_subject_teachers(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    rows = db.query(SubjectTeacher).all()
    out = []
    for st in rows:
        teacher = db.query(User).filter(User.id == st.teacher_id).first()
        course = db.query(Course).filter(Course.id == st.course_id).first()
        division = db.query(Division).filter(Division.id == st.division_id).first()
        out.append({
            "id": st.id,
            "teacher_id": st.teacher_id, "teacher_name": teacher.name if teacher else None,
            "course_id": st.course_id,
            "course_code": course.course_code if course else None,
            "course_name": course.course_name if course else None,
            "division_id": st.division_id,
            "division_name": division.name if division else None,
        })
    return out


@router.delete("/admin/subject-teachers/{assignment_id}", status_code=204)
async def remove_subject_teacher(
    assignment_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    st = db.query(SubjectTeacher).filter(SubjectTeacher.id == assignment_id).first()
    if st is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(st)
    db.commit()


# ============================================================
#  STUDENT — list eligible mentors (their branch), choose, change
# ============================================================
def _student_branch_id(db: Session, student: User) -> str | None:
    """A student's branch = the branch of their division."""
    if not student.division_id:
        return None
    division = db.query(Division).filter(Division.id == student.division_id).first()
    return division.branch_id if division else None


@router.get("/student/eligible-mentors", response_model=list[TeacherBrief])
async def list_eligible_mentors(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view mentors")
    branch_id = _student_branch_id(db, current)
    if not branch_id:
        raise HTTPException(status_code=400, detail="You are not assigned to a division/branch yet")

    teachers = db.query(User).filter(
        User.role == "teacher",
        User.branch_id == branch_id,
        User.is_active == True,
    ).order_by(User.name).all()
    return [{"id": t.id, "name": t.name, "email": t.email, "department": t.department} for t in teachers]


@router.put("/student/mentor", response_model=dict)
async def choose_mentor(
    payload: MentorChoose,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Only students can choose a mentor")
    branch_id = _student_branch_id(db, current)
    if not branch_id:
        raise HTTPException(status_code=400, detail="You are not assigned to a division/branch yet")

    mentor = db.query(User).filter(User.id == payload.mentor_id, User.role == "teacher").first()
    if mentor is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    if mentor.branch_id != branch_id:
        raise HTTPException(status_code=403, detail="You can only choose a mentor from your own branch")

    current.mentor_id = mentor.id
    db.commit()
    return {"studentId": current.id, "mentorId": mentor.id, "mentorName": mentor.name}


@router.get("/student/mentor", response_model=dict)
async def get_my_mentor(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Only students have a mentor")
    if not current.mentor_id:
        return {"mentor": None}
    mentor = db.query(User).filter(User.id == current.mentor_id).first()
    if not mentor:
        return {"mentor": None}
    return {"mentor": {"id": mentor.id, "name": mentor.name, "email": mentor.email, "department": mentor.department}}


@router.delete("/student/mentor", status_code=204)
async def remove_my_mentor(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Only students have a mentor")
    current.mentor_id = None
    db.commit()


def _teaches_student(db: Session, teacher_id: str, student: User) -> bool:
    """True if the teacher has a subject-teacher assignment in the student's division."""
    if not student.division_id:
        return False
    return db.query(SubjectTeacher).filter(
        SubjectTeacher.teacher_id == teacher_id,
        SubjectTeacher.division_id == student.division_id,
    ).first() is not None


@router.get("/teacher/my-students", response_model=list[dict])
async def my_taught_students(
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_user),
):
    if teacher.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    division_ids = [r.division_id for r in db.query(SubjectTeacher.division_id).filter(
        SubjectTeacher.teacher_id == teacher.id
    ).distinct().all()]
    if not division_ids:
        return []
    students = db.query(User).filter(
        User.role == "student", User.division_id.in_(division_ids)
    ).order_by(User.prn).all()
    return [{"id": s.id, "prn": s.prn, "name": s.name, "cgpa": s.cgpa,
             "currentSemester": s.current_semester} for s in students]


@router.get("/teacher/student/{student_id}/academics", response_model=dict)
async def subject_teacher_view_academics(
    student_id: str,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_user),
):
    if teacher.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    is_mentor = (student.mentor_id == teacher.id)
    if not _teaches_student(db, teacher.id, student) and not is_mentor:
        raise HTTPException(status_code=403, detail="You don't teach or mentor this student")

    academics = compute_student_cgpa(db, student_id)
    return {
        "studentId": student.id, "prn": student.prn, "name": student.name,
        "cgpa": academics["cgpa"], "totalCredits": academics["total_credits"],
        "semesters": academics["semesters"],
    }


@router.get("/mentor/student/{student_id}/full", response_model=dict)
async def mentor_full_view(
    student_id: str,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_user),
):
    if teacher.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.mentor_id != teacher.id:
        raise HTTPException(status_code=403, detail="You are not this student's mentor")

    academics = compute_student_cgpa(db, student_id)
    profile = db.query(Profile).filter(Profile.user_id == student_id).first()
    tech = db.query(TechnicalSkill).filter(TechnicalSkill.user_id == student_id).all()
    soft = db.query(SoftSkill).filter(SoftSkill.user_id == student_id).all()
    langs = db.query(Language).filter(Language.user_id == student_id).all()
    projects = db.query(Project).filter(Project.user_id == student_id).all()
    achievements = db.query(Achievement).filter(Achievement.user_id == student_id).all()
    experiences = db.query(Experience).filter(Experience.user_id == student_id).all()
    notes = db.query(PrivateNote).filter(
        PrivateNote.student_id == student_id, PrivateNote.teacher_id == teacher.id
    ).order_by(PrivateNote.created_at.desc()).all()

    return {
        "studentId": student.id, "prn": student.prn, "name": student.name,
        "academics": {"cgpa": academics["cgpa"], "semesters": academics["semesters"]},
        "profile": {"about": profile.about if profile else None} if profile else None,
        "skills": {
            "technical": [{"id": s.id, "name": s.name, "proficiency": s.proficiency} for s in tech],
            "soft": [{"id": s.id, "name": s.name} for s in soft],
            "languages": [{"id": s.id, "name": s.name} for s in langs],
        },
        "projects": [{"id": p.id, "name": getattr(p, "name", None) or getattr(p, "title", None)} for p in projects],
        "achievements": [{"id": a.id, "title": getattr(a, "title", None)} for a in achievements],
        "experiences": [{"id": e.id, "role": getattr(e, "role", None) or getattr(e, "title", None)} for e in experiences],
        "notes": [{"id": n.id, "content": n.content, "createdAt": n.created_at.isoformat() if n.created_at else None} for n in notes],
    }


@router.post("/mentor/student/{student_id}/notes", response_model=dict, status_code=201)
async def mentor_add_note(
    student_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_user),
):
    if teacher.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.mentor_id != teacher.id:
        raise HTTPException(status_code=403, detail="You are not this student's mentor")

    content = (payload.get("content") or "").strip()
    if not content:
        raise HTTPException(status_code=422, detail="Note content is required")

    note = PrivateNote(teacher_id=teacher.id, student_id=student_id, content=content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "content": note.content,
            "createdAt": note.created_at.isoformat() if note.created_at else None}