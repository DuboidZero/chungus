from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.mentor import MentorAssignment
from app.models.academic import Semester, Subject
from app.models.project import Project
from app.models.profile import Profile
from app.models.achievement import Achievement
from app.models.skill import TechnicalSkill, SoftSkill, Language
from app.models.teacher_records import PrivateNote, AssessmentMark, ProjectMilestone, GuidanceCase
from app.schemas.project import ProjectResponse
from app.schemas.academic import SemesterResponse
from app.core.dependencies import get_current_teacher, get_db, assert_mentors_student
from app.core.grading import calculate_sgpa, calculate_cgpa, cgpa_to_percentage
from app.core.teacher_helpers import student_cgpa, performance_tier

router = APIRouter()


@router.get("/students")
def list_my_students(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    links = db.query(MentorAssignment).filter(MentorAssignment.teacher_id == teacher.id).all()
    student_ids = [l.student_id for l in links]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    result = []
    for s in students:
        cgpa = student_cgpa(db, s.id)
        profile = db.query(Profile).filter(Profile.user_id == s.id).first()
        result.append({
            "id": s.id, "prn": s.prn, "name": s.name, "cgpa": cgpa,
            "performanceTier": performance_tier(cgpa),
            "guidanceStatus": None, "lastInteractionDate": None,
            "avatar": profile.avatar if profile else None,
        })
    return result

@router.get("/projects")
def list_mentored_projects(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    """All projects across the teacher's mentored students, each tagged with student name + PRN."""
    links = db.query(MentorAssignment).filter(MentorAssignment.teacher_id == teacher.id).all()
    student_ids = [l.student_id for l in links]
    if not student_ids:
        return []

    students = db.query(User).filter(User.id.in_(student_ids)).all()
    student_map = {s.id: s for s in students}

    projects = db.query(Project).filter(Project.user_id.in_(student_ids)).all()
    result = []
    for p in projects:
        student = student_map.get(p.user_id)
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "domain": p.domain,
            "techStack": p.tech_stack,
            "type": p.type,
            "mentorName": p.mentor_name,
            "status": p.status,
            "startDate": p.start_date.isoformat() if p.start_date else None,
            "endDate": p.end_date.isoformat() if p.end_date else None,
            "imageUrl": p.image_url,
            "studentName": student.name if student else None,
            "studentPrn": student.prn if student else None,
        })
    return result

@router.get("/students/{student_id}/overview")
def student_overview(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)

    # Counts
    project_count = db.query(Project).filter(Project.user_id == student_id).count()
    achievement_count = db.query(Achievement).filter(Achievement.user_id == student_id).count()
    skill_count = (
        db.query(TechnicalSkill).filter(TechnicalSkill.user_id == student_id).count()
        + db.query(SoftSkill).filter(SoftSkill.user_id == student_id).count()
        + db.query(Language).filter(Language.user_id == student_id).count()
    )

    # CGPA + trend + credits
    semesters = db.query(Semester).filter(Semester.user_id == student_id).order_by(Semester.semester_number).all()
    all_subjects = []
    cgpa_trend = []
    total_credits = 0
    for sem in semesters:
        subs = db.query(Subject).filter(Subject.semester_id == sem.id).all()
        all_subjects.extend(subs)
        total_credits += sum(s.credits for s in subs)
        cgpa_trend.append({"semester": f"Sem {sem.semester_number}", "cgpa": calculate_sgpa(subs), "projected": None})

    overall_cgpa = calculate_cgpa(all_subjects)

    return {
        "stats": {
            "cgpa": overall_cgpa,
            "percentage": cgpa_to_percentage(overall_cgpa) if overall_cgpa else 0,
            "totalCredits": total_credits,
            "projectCount": project_count,
            "achievementCount": achievement_count,
            "skillCount": skill_count,
        },
        "cgpaTrend": cgpa_trend,
        "upcomingDeadlines": [],
    }


@router.get("/students/{student_id}/academic-records", response_model=list[SemesterResponse])
def student_academic_records(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    semesters = db.query(Semester).filter(Semester.user_id == student_id).all()
    result = []
    for sem in semesters:
        subs = sem.subjects
        result.append({
            "id": sem.id, "semester_number": sem.semester_number,
            "gpa": calculate_sgpa(subs), "total_credits": sum(s.credits for s in subs),
            "subjects": subs, "created_at": sem.created_at, "updated_at": sem.updated_at,
        })
    return result


@router.get("/students/{student_id}/projects", response_model=list[ProjectResponse])
def student_projects(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    return db.query(Project).filter(Project.user_id == student_id).all()


@router.get("/students/{student_id}/timeline")
def student_timeline(student_id: str, type: str | None = None, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    events = []
    for n in db.query(PrivateNote).filter(PrivateNote.student_id == student_id).all():
        events.append({"id": n.id, "type": "NOTE", "date": n.created_at,
            "title": "Private Note Added", "description": n.content,
            "author": teacher.name or "Teacher", "isTeacherInitiated": True, "metadata": {}})
    for m in db.query(AssessmentMark).filter(AssessmentMark.student_id == student_id).all():
        events.append({"id": m.id, "type": "MARK", "date": m.created_at,
            "title": f"Assessment: {m.assessment_title}", "description": m.comments or "",
            "author": teacher.name or "Teacher", "isTeacherInitiated": True,
            "metadata": {"score": m.score, "maxScore": m.max_score, "projectId": m.project_id}})
    project_ids = [p.id for p in db.query(Project).filter(Project.user_id == student_id).all()]
    if project_ids:
        for ms in db.query(ProjectMilestone).filter(ProjectMilestone.project_id.in_(project_ids)).all():
            events.append({"id": ms.id, "type": "PROJECT_MILESTONE", "date": ms.created_at,
                "title": f"Milestone: {ms.description}", "description": f"Status: {ms.status}",
                "author": teacher.name or "Teacher", "isTeacherInitiated": True,
                "metadata": {"projectId": ms.project_id, "status": ms.status}})
    for a in db.query(Achievement).filter(Achievement.user_id == student_id).all():
        events.append({"id": a.id, "type": "ACHIEVEMENT", "date": a.created_at,
            "title": f"Achievement Added: {a.title}", "description": f"{a.level} level — {a.category}",
            "author": "Student", "isTeacherInitiated": False,
            "metadata": {"level": a.level, "category": a.category}})
    for sk in db.query(TechnicalSkill).filter(TechnicalSkill.user_id == student_id).all():
        events.append({"id": sk.id, "type": "SKILL_ADD", "date": sk.created_at,
            "title": f"Skill Added: {sk.name}", "description": f"Proficiency {sk.proficiency}/5 — {sk.domain}",
            "author": "Student", "isTeacherInitiated": False,
            "metadata": {"domain": sk.domain, "proficiency": sk.proficiency}})
    for g in db.query(GuidanceCase).filter(GuidanceCase.student_id == student_id).all():
        events.append({"id": g.id, "type": "GUIDANCE_CASE", "date": g.created_at,
            "title": "Guidance Case Opened", "description": f"Trigger: {g.trigger_signal or 'N/A'}",
            "author": "System", "isTeacherInitiated": False,
            "metadata": {"caseId": g.id, "status": g.status}})
    if type:
        events = [e for e in events if e["type"] == type]
    events.sort(key=lambda e: e["date"], reverse=True)
    return events


@router.get("/students/{student_id}")
def get_student_basic(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    student = db.query(User).filter(User.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    profile = db.query(Profile).filter(Profile.user_id == student_id).first()
    return {
        "id": student.id,
        "name": student.name,
        "prn": student.prn,
        "role": student.role,
        "avatar": profile.avatar if profile else None,
    }


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def project_details(project_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    assert_mentors_student(db, teacher.id, project.user_id)
    return project