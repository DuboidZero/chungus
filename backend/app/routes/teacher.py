from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date as _date
from app.models.user import User
from app.models.mentor import MentorAssignment
from app.models.academic import Semester, Subject
from app.models.project import Project
from app.models.profile import Profile
from app.models.achievement import Achievement
from app.models.teacher_records import PrivateNote, AssessmentMark, ProjectMilestone, GuidanceCase
from app.models.skill import TechnicalSkill, SoftSkill, Language
from app.schemas.teacher import (
    NoteCreate, NoteUpdate, NoteResponse,
    MarkCreate, MarkResponse,
    MilestoneCreate, MilestoneResponse,
    GuidanceCaseCreate, GuidanceCaseUpdate, GuidanceCaseResponse,
)
from app.schemas.profile import ProfileResponse
from app.schemas.project import ProjectResponse
from app.schemas.academic import SemesterResponse
from app.core.dependencies import get_current_teacher, get_db, assert_mentors_student
from app.core.grading import calculate_cgpa, calculate_sgpa

router = APIRouter(prefix="/teacher", tags=["teacher"])


# ============================================================
#  Helpers
# ============================================================
def _student_cgpa(db: Session, student_id: str) -> float:
    semesters = db.query(Semester).filter(Semester.user_id == student_id).all()
    all_subjects = []
    for sem in semesters:
        all_subjects.extend(db.query(Subject).filter(Subject.semester_id == sem.id).all())
    return calculate_cgpa(all_subjects)


def _performance_tier(cgpa: float) -> str:
    """[assumption — confirm cutoffs with team]"""
    if cgpa >= 7.75:
        return "High Performing"
    if cgpa >= 5.0:
        return "Average - Guidable"
    return "Underperforming"


def _note_out(note: PrivateNote, teacher_name: str | None) -> dict:
    return {
        "id": note.id,
        "student_id": note.student_id,
        "teacher_id": note.teacher_id,
        "teacher_name": teacher_name,
        "content": note.content,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


def _mark_out(mark: AssessmentMark, teacher_name: str | None) -> dict:
    return {
        "id": mark.id,
        "student_id": mark.student_id,
        "project_id": mark.project_id,
        "assessment_title": mark.assessment_title,
        "score": mark.score,
        "max_score": mark.max_score,
        "comments": mark.comments,
        "teacher_id": mark.teacher_id,
        "teacher_name": teacher_name,
        "date": mark.date,
        "created_at": mark.created_at,
        "updated_at": mark.updated_at,
    }


# ============================================================
#  Students list
# ============================================================
@router.get("/students")
def list_my_students(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    links = db.query(MentorAssignment).filter(MentorAssignment.teacher_id == teacher.id).all()
    student_ids = [l.student_id for l in links]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []

    result = []
    for s in students:
        cgpa = _student_cgpa(db, s.id)
        result.append({
            "id": s.id,
            "prn": s.prn,
            "name": s.name,
            "cgpa": cgpa,
            "performanceTier": _performance_tier(cgpa),
            "guidanceStatus": None,
            "lastInteractionDate": None,
        })
    return result


# ============================================================
#  Private notes
# ============================================================
@router.post("/students/{student_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def add_note(student_id: str, payload: NoteCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    note = PrivateNote(teacher_id=teacher.id, student_id=student_id, content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return _note_out(note, teacher.name)


@router.patch("/students/{student_id}/notes/{note_id}", response_model=NoteResponse)
def edit_note(student_id: str, note_id: str, payload: NoteUpdate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    note = db.query(PrivateNote).filter(PrivateNote.id == note_id, PrivateNote.student_id == student_id).first()
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.teacher_id != teacher.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author can edit this note")
    note.content = payload.content
    db.commit()
    db.refresh(note)
    return _note_out(note, teacher.name)


@router.delete("/students/{student_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(student_id: str, note_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    note = db.query(PrivateNote).filter(PrivateNote.id == note_id, PrivateNote.student_id == student_id).first()
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.teacher_id != teacher.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author can delete this note")
    db.delete(note)
    db.commit()


# ============================================================
#  Assessment marks
# ============================================================
@router.post("/students/{student_id}/marks", response_model=MarkResponse, status_code=status.HTTP_201_CREATED)
def add_student_mark(student_id: str, payload: MarkCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    mark = AssessmentMark(
        teacher_id=teacher.id, student_id=student_id, project_id=None,
        assessment_title=payload.assessment_title, score=payload.score,
        max_score=payload.max_score, comments=payload.comments, date=payload.date,
    )
    db.add(mark)
    db.commit()
    db.refresh(mark)
    return _mark_out(mark, teacher.name)


@router.get("/students/{student_id}/marks", response_model=list[MarkResponse])
def get_student_marks(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    marks = db.query(AssessmentMark).filter(AssessmentMark.student_id == student_id).all()
    return [_mark_out(m, teacher.name) for m in marks]


@router.get("/marks", response_model=list[MarkResponse])
def get_my_marks(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    marks = db.query(AssessmentMark).filter(AssessmentMark.teacher_id == teacher.id).all()
    return [_mark_out(m, teacher.name) for m in marks]


@router.post("/projects/{project_id}/marks", response_model=MarkResponse, status_code=status.HTTP_201_CREATED)
def add_project_mark(project_id: str, payload: MarkCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    assert_mentors_student(db, teacher.id, project.user_id)
    mark = AssessmentMark(
        teacher_id=teacher.id, student_id=project.user_id, project_id=project_id,
        assessment_title=payload.assessment_title, score=payload.score,
        max_score=payload.max_score, comments=payload.comments, date=payload.date,
    )
    db.add(mark)
    db.commit()
    db.refresh(mark)
    return _mark_out(mark, teacher.name)


@router.get("/projects/{project_id}/marks", response_model=list[MarkResponse])
def get_project_marks(project_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    marks = db.query(AssessmentMark).filter(AssessmentMark.project_id == project_id).all()
    return [_mark_out(m, teacher.name) for m in marks]


# ============================================================
#  Project milestones
# ============================================================
@router.post("/projects/{project_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def add_milestone(project_id: str, payload: MilestoneCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    assert_mentors_student(db, teacher.id, project.user_id)
    milestone = ProjectMilestone(
        project_id=project_id, description=payload.description,
        status=payload.status.value, date=payload.date,
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.get("/projects/{project_id}/milestones", response_model=list[MilestoneResponse])
def get_milestones(project_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    return db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()


# ============================================================
#  Read views — a teacher viewing their student's data
# ============================================================
@router.get("/students/{student_id}/overview")
def student_overview(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)

    profile = db.query(Profile).filter(Profile.user_id == student_id).first()
    cgpa = _student_cgpa(db, student_id)

    semesters = db.query(Semester).filter(Semester.user_id == student_id).order_by(Semester.semester_number).all()
    cgpa_trend = []
    for sem in semesters:
        subs = db.query(Subject).filter(Subject.semester_id == sem.id).all()
        cgpa_trend.append({"semester": f"Sem {sem.semester_number}", "cgpa": calculate_sgpa(subs)})

    active_projects = db.query(Project).filter(Project.user_id == student_id, Project.status == "Ongoing").count()
    total_achievements = db.query(Achievement).filter(Achievement.user_id == student_id).count()

    return {
        "profile": profile,
        "cgpa": cgpa,
        "cgpaTrend": cgpa_trend,
        "radarSkills": [],   # [assumption] skill radar scoring not defined — flag to team
        "activeProjectsCount": active_projects,
        "totalAchievements": total_achievements,
    }


@router.get("/students/{student_id}/academic-records", response_model=list[SemesterResponse])
def student_academic_records(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    semesters = db.query(Semester).filter(Semester.user_id == student_id).all()
    result = []
    for sem in semesters:
        subs = sem.subjects
        result.append({
            "id": sem.id,
            "semester_number": sem.semester_number,
            "gpa": calculate_sgpa(subs),
            "total_credits": sum(s.credits for s in subs),
            "subjects": subs,
            "created_at": sem.created_at,
            "updated_at": sem.updated_at,
        })
    return result


@router.get("/students/{student_id}/projects", response_model=list[ProjectResponse])
def student_projects(student_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, student_id)
    return db.query(Project).filter(Project.user_id == student_id).all()


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def project_details(project_id: str, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    assert_mentors_student(db, teacher.id, project.user_id)
    return project

@router.post("/guidance-cases", response_model=GuidanceCaseResponse, status_code=status.HTTP_201_CREATED)
def open_guidance_case(payload: GuidanceCaseCreate, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    assert_mentors_student(db, teacher.id, payload.student_id)
    case = GuidanceCase(
        student_id=payload.student_id,
        owning_teacher_id=teacher.id,
        trigger_signal=payload.trigger_signal,
        status="Open",
        date_opened=_date.today(),
    )
    db.add(case)
    db.commit()
    db.refresh(case)
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
    db.commit()
    db.refresh(case)
    return case


@router.get("/students/{student_id}/timeline")
def student_timeline(
    student_id: str,
    type: str | None = None,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    assert_mentors_student(db, teacher.id, student_id)
    events = []

    # 1. Notes (teacher-initiated)
    for n in db.query(PrivateNote).filter(PrivateNote.student_id == student_id).all():
        events.append({
            "id": n.id, "type": "NOTE", "date": n.created_at,
            "title": "Private Note Added", "description": n.content,
            "author": teacher.name or "Teacher", "isTeacherInitiated": True, "metadata": {},
        })

    # 2. Marks
    for m in db.query(AssessmentMark).filter(AssessmentMark.student_id == student_id).all():
        events.append({
            "id": m.id, "type": "MARK", "date": m.created_at,
            "title": f"Assessment: {m.assessment_title}", "description": m.comments or "",
            "author": teacher.name or "Teacher", "isTeacherInitiated": True,
            "metadata": {"score": m.score, "maxScore": m.max_score, "projectId": m.project_id},
        })

    # 3. Project milestones (need the student's project ids)
    project_ids = [p.id for p in db.query(Project).filter(Project.user_id == student_id).all()]
    if project_ids:
        for ms in db.query(ProjectMilestone).filter(ProjectMilestone.project_id.in_(project_ids)).all():
            events.append({
                "id": ms.id, "type": "PROJECT_MILESTONE", "date": ms.created_at,
                "title": f"Milestone: {ms.description}", "description": f"Status: {ms.status}",
                "author": teacher.name or "Teacher", "isTeacherInitiated": True,
                "metadata": {"projectId": ms.project_id, "status": ms.status},
            })

    # 4. Achievements (student-initiated)
    for a in db.query(Achievement).filter(Achievement.user_id == student_id).all():
        events.append({
            "id": a.id, "type": "ACHIEVEMENT", "date": a.created_at,
            "title": f"Achievement Added: {a.title}", "description": f"{a.level} level — {a.category}",
            "author": "Student", "isTeacherInitiated": False,
            "metadata": {"level": a.level, "category": a.category},
        })

    # 5. Skills added (student-initiated)
    for sk in db.query(TechnicalSkill).filter(TechnicalSkill.user_id == student_id).all():
        events.append({
            "id": sk.id, "type": "SKILL_ADD", "date": sk.created_at,
            "title": f"Skill Added: {sk.name}", "description": f"Proficiency {sk.proficiency}/5 — {sk.domain}",
            "author": "Student", "isTeacherInitiated": False,
            "metadata": {"domain": sk.domain, "proficiency": sk.proficiency},
        })

    # 6. Guidance cases (system)
    for g in db.query(GuidanceCase).filter(GuidanceCase.student_id == student_id).all():
        events.append({
            "id": g.id, "type": "GUIDANCE_CASE", "date": g.created_at,
            "title": "Guidance Case Opened", "description": f"Trigger: {g.trigger_signal or 'N/A'}",
            "author": "System", "isTeacherInitiated": False,
            "metadata": {"caseId": g.id, "status": g.status},
        })

    # Optional filter by type
    if type:
        events = [e for e in events if e["type"] == type]

    # Sort newest first
    events.sort(key=lambda e: e["date"], reverse=True)
    return events

@router.get("/dashboard")
def teacher_dashboard(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    # My assigned students
    links = db.query(MentorAssignment).filter(MentorAssignment.teacher_id == teacher.id).all()
    student_ids = [l.student_id for l in links]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    student_by_id = {s.id: s for s in students}

    # Per-student CGPA + tier
    student_data = []
    for s in students:
        cgpa = _student_cgpa(db, s.id)
        student_data.append({"user": s, "cgpa": cgpa, "tier": _performance_tier(cgpa)})

    high = sum(1 for d in student_data if d["tier"] == "High Performing")
    mid = sum(1 for d in student_data if d["tier"] == "Average - Guidable")
    under = sum(1 for d in student_data if d["tier"] == "Underperforming")

    # Guidance cases
    all_cases = db.query(GuidanceCase).filter(GuidanceCase.student_id.in_(student_ids)).all() if student_ids else []
    open_case_student_ids = {c.student_id for c in all_cases if c.status != "Resolved"}
    active_cases = len(open_case_student_ids)

    # --- Support needed (rule: CGPA < 6.0 OR open guidance case) ---
    support_needed = []
    for d in student_data:
        reasons = []
        if d["cgpa"] and d["cgpa"] < 6.0:
            reasons.append("Low CGPA")
        if d["user"].id in open_case_student_ids:
            reasons.append("Open Guidance Case")
        if reasons:
            support_needed.append({
                "id": d["user"].id,
                "studentId": d["user"].id,
                "studentName": d["user"].name,
                "studentPrn": d["user"].prn,
                "studentCgpa": d["cgpa"],
                "urgencyLabel": "Critical" if (d["cgpa"] and d["cgpa"] < 5.0) else "Moderate",
                "reasonTags": reasons,
                "isActiveSupport": d["user"].id in open_case_student_ids,
                "createdAt": d["user"].created_at,
            })

    # --- Guidance cases list (detailed) ---
    guidance_list = []
    for c in all_cases:
        stu = student_by_id.get(c.student_id)
        guidance_list.append({
            "id": c.id, "studentId": c.student_id,
            "studentName": stu.name if stu else None,
            "studentPrn": stu.prn if stu else None,
            "studentCgpa": _student_cgpa(db, c.student_id),
            "triggerSignal": c.trigger_signal,
            "owningTeacherId": c.owning_teacher_id,
            "owningTeacherName": teacher.name,
            "status": c.status,
            "resolutionNote": c.resolution_note,
            "dateOpened": c.date_opened,
            "dateResolved": c.date_resolved,
            "createdAt": c.created_at, "updatedAt": c.updated_at,
        })

    # --- CGPA distribution ---
    def bucket(c):
        if c >= 9.0: return "9.0-10.0"
        if c >= 8.0: return "8.0-8.9"
        if c >= 7.0: return "7.0-7.9"
        if c >= 6.0: return "6.0-6.9"
        return "< 6.0"
    dist = {"9.0-10.0": 0, "8.0-8.9": 0, "7.0-7.9": 0, "6.0-6.9": 0, "< 6.0": 0}
    for d in student_data:
        dist[bucket(d["cgpa"])] += 1
    cgpa_distribution = [{"range": k, "count": v} for k, v in dist.items()]

    # --- GPA trend (avg SGPA per semester) ---
    sem_totals = {}
    for s in students:
        for sem in db.query(Semester).filter(Semester.user_id == s.id).all():
            subs = db.query(Subject).filter(Subject.semester_id == sem.id).all()
            sem_totals.setdefault(sem.semester_number, [0, 0])
            sem_totals[sem.semester_number][0] += calculate_sgpa(subs)
            sem_totals[sem.semester_number][1] += 1
    gpa_trend = [
        {"semester": f"Sem {n}", "averageGpa": round(t[0] / t[1], 2) if t[1] else 0}
        for n, t in sorted(sem_totals.items())
    ]

    # --- Skill heatmap (technical skills) ---
    skill_map = {}
    for s in students:
        for sk in db.query(TechnicalSkill).filter(TechnicalSkill.user_id == s.id).all():
            skill_map.setdefault(sk.name, [0, 0])
            skill_map[sk.name][0] += 1
            skill_map[sk.name][1] += sk.proficiency
    skill_heatmap = [
        {"skill": name, "studentCount": v[0], "averageProficiency": round(v[1] / v[0], 1) if v[0] else 0}
        for name, v in skill_map.items()
    ]

    # --- Domain interests (from technical skills' domains) ---
    domain_map = {}
    for s in students:
        for sk in db.query(TechnicalSkill).filter(TechnicalSkill.user_id == s.id).all():
            if sk.domain:
                domain_map[sk.domain] = domain_map.get(sk.domain, 0) + 1
    domain_interests = [{"domain": k, "count": v} for k, v in domain_map.items()]

    # --- Achievement volume (by category + level) ---
    ach_map = {}
    for s in students:
        for a in db.query(Achievement).filter(Achievement.user_id == s.id).all():
            key = (a.category, a.level)
            ach_map[key] = ach_map.get(key, 0) + 1
    achievement_volume = [
        {"category": k[0], "level": k[1], "count": v} for k, v in ach_map.items()
    ]

    # --- Project activity (by domain + first tech) ---
    proj_map = {}
    for s in students:
        for p in db.query(Project).filter(Project.user_id == s.id).all():
            tech = (p.tech_stack[0] if p.tech_stack else "N/A")
            key = (p.domain or "N/A", tech)
            proj_map[key] = proj_map.get(key, 0) + 1
    project_activity = [
        {"domain": k[0], "techStack": k[1], "count": v} for k, v in proj_map.items()
    ]

    # --- Internship preferences (from profiles) ---
    pref_map = {"online": 0, "offline": 0, "none": 0}
    for s in students:
        prof = db.query(Profile).filter(Profile.user_id == s.id).first()
        pref = (prof.internship_preference if prof else "none") or "none"
        pref_map[pref] = pref_map.get(pref, 0) + 1
    internship_preferences = [{"preference": k, "count": v} for k, v in pref_map.items()]

    return {
        "stats": {
            "totalAssignedStudents": len(students),
            "highPerformingCount": high,
            "midTierCount": mid,
            "underperformingCount": under,
            "activeGuidanceCases": active_cases,
        },
        "supportNeeded": support_needed,
        "guidanceCases": guidance_list,
        "cgpaDistribution": cgpa_distribution,
        "gpaTrend": gpa_trend,
        "skillHeatmap": skill_heatmap,
        "domainInterests": domain_interests,
        "achievementVolume": achievement_volume,
        "projectActivity": project_activity,
        "internshipPreferences": internship_preferences,
    }