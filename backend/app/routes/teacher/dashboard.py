from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.mentor import MentorAssignment
from app.models.academic import Semester, Subject
from app.models.project import Project
from app.models.profile import Profile
from app.models.achievement import Achievement
from app.models.skill import TechnicalSkill
from app.models.teacher_records import GuidanceCase
from app.core.dependencies import get_current_teacher, get_db
from app.core.grading import calculate_sgpa
from app.core.teacher_helpers import student_cgpa, performance_tier

router = APIRouter()


@router.get("/dashboard")
def teacher_dashboard(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    links = db.query(MentorAssignment).filter(MentorAssignment.teacher_id == teacher.id).all()
    student_ids = [l.student_id for l in links]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    student_by_id = {s.id: s for s in students}

    student_data = []
    for s in students:
        cgpa = student_cgpa(db, s.id)
        student_data.append({"user": s, "cgpa": cgpa, "tier": performance_tier(cgpa)})

    high = sum(1 for d in student_data if d["tier"] == "High Performing")
    mid = sum(1 for d in student_data if d["tier"] == "Average - Guidable")
    under = sum(1 for d in student_data if d["tier"] == "Underperforming")

    all_cases = db.query(GuidanceCase).filter(GuidanceCase.student_id.in_(student_ids)).all() if student_ids else []
    open_case_student_ids = {c.student_id for c in all_cases if c.status != "Resolved"}
    active_cases = len(open_case_student_ids)

    support_needed = []
    for d in student_data:
        reasons = []
        if d["cgpa"] and d["cgpa"] < 6.0:
            reasons.append("Low CGPA")
        if d["user"].id in open_case_student_ids:
            reasons.append("Open Guidance Case")
        if reasons:
            support_needed.append({
                "id": d["user"].id, "studentId": d["user"].id, "studentName": d["user"].name,
                "studentPrn": d["user"].prn, "studentCgpa": d["cgpa"],
                "urgencyLabel": "Critical" if (d["cgpa"] and d["cgpa"] < 5.0) else "Moderate",
                "reasonTags": reasons, "isActiveSupport": d["user"].id in open_case_student_ids,
                "createdAt": d["user"].created_at,
            })

    guidance_list = []
    for c in all_cases:
        stu = student_by_id.get(c.student_id)
        guidance_list.append({
            "id": c.id, "studentId": c.student_id,
            "studentName": stu.name if stu else None, "studentPrn": stu.prn if stu else None,
            "studentCgpa": student_cgpa(db, c.student_id), "triggerSignal": c.trigger_signal,
            "owningTeacherId": c.owning_teacher_id, "owningTeacherName": teacher.name,
            "status": c.status, "resolutionNote": c.resolution_note,
            "dateOpened": c.date_opened, "dateResolved": c.date_resolved,
            "createdAt": c.created_at, "updatedAt": c.updated_at,
        })

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

    sem_totals = {}
    for s in students:
        for sem in db.query(Semester).filter(Semester.user_id == s.id).all():
            subs = db.query(Subject).filter(Subject.semester_id == sem.id).all()
            sem_totals.setdefault(sem.semester_number, [0, 0])
            sem_totals[sem.semester_number][0] += calculate_sgpa(subs)
            sem_totals[sem.semester_number][1] += 1
    gpa_trend = [{"semester": f"Sem {n}", "averageGpa": round(t[0] / t[1], 2) if t[1] else 0}
                 for n, t in sorted(sem_totals.items())]

    skill_map = {}
    for s in students:
        for sk in db.query(TechnicalSkill).filter(TechnicalSkill.user_id == s.id).all():
            skill_map.setdefault(sk.name, [0, 0])
            skill_map[sk.name][0] += 1
            skill_map[sk.name][1] += sk.proficiency
    skill_heatmap = [{"skill": name, "studentCount": v[0],
                      "averageProficiency": round(v[1] / v[0], 1) if v[0] else 0}
                     for name, v in skill_map.items()]

    domain_map = {}
    for s in students:
        for sk in db.query(TechnicalSkill).filter(TechnicalSkill.user_id == s.id).all():
            if sk.domain:
                domain_map[sk.domain] = domain_map.get(sk.domain, 0) + 1
    domain_interests = [{"domain": k, "count": v} for k, v in domain_map.items()]

    ach_map = {}
    for s in students:
        for a in db.query(Achievement).filter(Achievement.user_id == s.id).all():
            key = (a.category, a.level)
            ach_map[key] = ach_map.get(key, 0) + 1
    achievement_volume = [{"category": k[0], "level": k[1], "count": v} for k, v in ach_map.items()]

    proj_map = {}
    for s in students:
        for p in db.query(Project).filter(Project.user_id == s.id).all():
            tech = (p.tech_stack[0] if p.tech_stack else "N/A")
            key = (p.domain or "N/A", tech)
            proj_map[key] = proj_map.get(key, 0) + 1
    project_activity = [{"domain": k[0], "techStack": k[1], "count": v} for k, v in proj_map.items()]

    pref_map = {"online": 0, "offline": 0, "none": 0}
    for s in students:
        prof = db.query(Profile).filter(Profile.user_id == s.id).first()
        pref = (prof.internship_preference if prof else "none") or "none"
        pref_map[pref] = pref_map.get(pref, 0) + 1
    internship_preferences = [{"preference": k, "count": v} for k, v in pref_map.items()]

    return {
        "stats": {"totalAssignedStudents": len(students), "highPerformingCount": high,
                  "midTierCount": mid, "underperformingCount": under, "activeGuidanceCases": active_cases},
        "supportNeeded": support_needed, "guidanceCases": guidance_list,
        "cgpaDistribution": cgpa_distribution, "gpaTrend": gpa_trend,
        "skillHeatmap": skill_heatmap, "domainInterests": domain_interests,
        "achievementVolume": achievement_volume, "projectActivity": project_activity,
        "internshipPreferences": internship_preferences,
    }