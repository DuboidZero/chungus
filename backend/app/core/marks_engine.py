"""
Phase 2 marks engine — computes subject totals, grades, SGPA and CGPA from the
component-based MarksEntry rows. Reuses the official grade scale in grading.py.
Nothing is stored (except cached CGPA); all derived on demand so it never drifts.
"""
from sqlalchemy.orm import Session
from app.core.grading import marks_to_grade, GRADE_POINTS
from app.models.marks import MarksEntry, SchemeComponent
from app.models.academic_structure import Course


def compute_subject_result(db: Session, student_id: str, course: Course) -> dict | None:
    if not course.marking_scheme_id:
        return None

    components = db.query(SchemeComponent).filter(
        SchemeComponent.scheme_id == course.marking_scheme_id
    ).order_by(SchemeComponent.display_order, SchemeComponent.code).all()
    if not components:
        return None

    entries = db.query(MarksEntry).filter(
        MarksEntry.student_id == student_id,
        MarksEntry.course_id == course.id,
    ).all()
    if not entries:
        return None

    by_component = {e.component_id: e.obtained_marks for e in entries}

    obtained_total = 0.0
    max_total = 0.0
    breakdown = []
    for c in components:
        obtained = by_component.get(c.id)
        max_total += c.max_marks
        got = obtained if obtained is not None else 0.0
        obtained_total += got
        breakdown.append({
            "code": c.code, "label": c.label,
            "obtained": obtained, "max": c.max_marks, "min": c.min_marks,
        })

    if max_total == 0:
        return None

    percentage = round((obtained_total / max_total) * 100, 2)
    grade = marks_to_grade(percentage)
    points = GRADE_POINTS.get(grade, 0)

    return {
        "course_id": course.id,
        "course_code": course.course_code,
        "course_name": course.course_name,
        "semester": course.semester,
        "credits": course.credits,
        "obtained_total": round(obtained_total, 2),
        "max_total": round(max_total, 2),
        "percentage": percentage,
        "grade": grade,
        "grade_points": points,
        "components": breakdown,
    }


def compute_student_semester(db: Session, student_id: str, semester: int) -> dict:
    courses = db.query(Course).filter(Course.semester == semester).all()
    subjects = []
    for course in courses:
        res = compute_subject_result(db, student_id, course)
        if res:
            subjects.append(res)

    total_credits = sum(s["credits"] for s in subjects)
    if total_credits > 0:
        weighted = sum(s["grade_points"] * s["credits"] for s in subjects)
        sgpa = round(weighted / total_credits, 2)
    else:
        sgpa = 0.0

    return {
        "semester": semester,
        "subjects": subjects,
        "total_credits": total_credits,
        "sgpa": sgpa,
    }


def compute_student_cgpa(db: Session, student_id: str) -> dict:
    course_ids = [r.course_id for r in db.query(MarksEntry.course_id).filter(
        MarksEntry.student_id == student_id
    ).distinct().all()]
    if not course_ids:
        return {"semesters": [], "cgpa": 0.0, "total_credits": 0}

    semesters = sorted({
        c.semester for c in db.query(Course).filter(Course.id.in_(course_ids)).all()
    })

    sem_results = [compute_student_semester(db, student_id, s) for s in semesters]

    grand_credits = sum(sr["total_credits"] for sr in sem_results)
    if grand_credits > 0:
        grand_weighted = sum(
            s["grade_points"] * s["credits"]
            for sr in sem_results for s in sr["subjects"]
        )
        cgpa = round(grand_weighted / grand_credits, 2)
    else:
        cgpa = 0.0

    return {
        "semesters": sem_results,
        "total_credits": grand_credits,
        "cgpa": cgpa,
    }


def recompute_and_cache_cgpa(db: Session, student_id: str) -> float:
    from app.models.user import User
    result = compute_student_cgpa(db, student_id)
    student = db.query(User).filter(User.id == student_id).first()
    if student:
        student.cgpa = result["cgpa"]
        db.commit()
    return result["cgpa"]