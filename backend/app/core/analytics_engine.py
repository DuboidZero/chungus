"""
Phase 4 analytics engine — builds chart-ready DATA from the marks engine.
Returns JSON (labels/values); the frontend draws the charts.
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.academic_structure import Course, Division, CourseDomain, Domain
from app.models.marks import MarksEntry
from app.core.marks_engine import compute_subject_result, compute_student_cgpa


# PRD-specified performance bands
BANDS = [
    ("<40%", 0, 40),
    ("40-60%", 40, 60),
    ("60-80%", 60, 80),
    (">80%", 80, 100.0001),
]


def _band_for(pct: float) -> str:
    for label, lo, hi in BANDS:
        if lo <= pct < hi:
            return label
    return ">80%"


def cohort_distribution_for_course(db: Session, course: Course) -> dict:
    """Histogram: how many students fall in each performance band for ONE course."""
    student_ids = [r.student_id for r in db.query(MarksEntry.student_id).filter(
        MarksEntry.course_id == course.id
    ).distinct().all()]

    counts = {label: 0 for label, _, _ in BANDS}
    total = 0
    for sid in student_ids:
        res = compute_subject_result(db, sid, course)
        if not res:
            continue
        counts[_band_for(res["percentage"])] += 1
        total += 1

    return {
        "courseId": course.id,
        "courseCode": course.course_code,
        "courseName": course.course_name,
        "totalStudents": total,
        "bands": [{"band": label, "count": counts[label]} for label, _, _ in BANDS],
    }


def at_risk_students_for_course(db: Session, course: Course, threshold: float = 40.0) -> dict:
    """Students who failed the subject OR are below the risk threshold %."""
    student_ids = [r.student_id for r in db.query(MarksEntry.student_id).filter(
        MarksEntry.course_id == course.id
    ).distinct().all()]

    at_risk = []
    for sid in student_ids:
        res = compute_subject_result(db, sid, course)
        if not res:
            continue
        is_risk = (not res["passed"]) or (res["percentage"] < threshold)
        if is_risk:
            student = db.query(User).filter(User.id == sid).first()
            reasons = []
            if not res["passed"]:
                reasons.append("failed subject")
            if res["percentage"] < threshold:
                reasons.append(f"below {int(threshold)}%")
            if res["has_absent"]:
                reasons.append("was absent")
            at_risk.append({
                "studentId": sid,
                "prn": student.prn if student else None,
                "name": student.name if student else None,
                "percentage": res["percentage"],
                "grade": res["grade"],
                "reasons": reasons,
            })

    at_risk.sort(key=lambda s: s["percentage"])
    return {
        "courseId": course.id,
        "courseCode": course.course_code,
        "courseName": course.course_name,
        "threshold": threshold,
        "atRiskCount": len(at_risk),
        "students": at_risk,
    }


def student_performance(db: Session, student_id: str) -> dict:
    """A student's own chart-ready performance: subject %s, grades, GPA, per-semester."""
    data = compute_student_cgpa(db, student_id)
    subject_bars = []
    for sem in data["semesters"]:
        for subj in sem["subjects"]:
            subject_bars.append({
                "courseCode": subj["course_code"],
                "courseName": subj["course_name"],
                "semester": subj["semester"],
                "percentage": subj["percentage"],
                "grade": subj["grade"],
                "gradePoints": subj["grade_points"],
                "passed": subj["passed"],
            })
    sgpa_trend = [{"semester": s["semester"], "sgpa": s["sgpa"]} for s in data["semesters"]]

    return {
        "studentId": student_id,
        "cgpa": data["cgpa"],
        "totalCredits": data["total_credits"],
        "subjectPerformance": subject_bars,
        "sgpaTrend": sgpa_trend,
    }


def class_grade_distribution(db: Session, course: Course) -> dict:
    """How many students got each grade (O, A+, A, ...) in a course."""
    student_ids = [r.student_id for r in db.query(MarksEntry.student_id).filter(
        MarksEntry.course_id == course.id
    ).distinct().all()]

    grade_counts = {}
    total_pct = 0.0
    n = 0
    for sid in student_ids:
        res = compute_subject_result(db, sid, course)
        if not res:
            continue
        grade_counts[res["grade"]] = grade_counts.get(res["grade"], 0) + 1
        total_pct += res["percentage"]
        n += 1

    order = ["O", "A+", "A", "B+", "B", "C", "P", "F"]
    dist = [{"grade": g, "count": grade_counts.get(g, 0)} for g in order if g in grade_counts]

    return {
        "courseId": course.id,
        "courseCode": course.course_code,
        "courseName": course.course_name,
        "classAverage": round(total_pct / n, 2) if n else 0,
        "totalStudents": n,
        "gradeDistribution": dist,
    }


def component_comparison(db: Session, student_id: str, course: Course) -> dict:
    """Normalize each component to a % so components with different maxes are
    comparable on ONE scale — spot strong vs weak areas within a subject."""
    from app.models.marks import SchemeComponent, MarksEntry
    if not course.marking_scheme_id:
        return {"course": course.course_code, "components": []}

    components = db.query(SchemeComponent).filter(
        SchemeComponent.scheme_id == course.marking_scheme_id
    ).order_by(SchemeComponent.display_order, SchemeComponent.code).all()

    entries = {e.component_id: e.obtained_marks for e in db.query(MarksEntry).filter(
        MarksEntry.student_id == student_id, MarksEntry.course_id == course.id
    ).all()}

    out = []
    for c in components:
        obtained = entries.get(c.id)
        got = obtained if obtained is not None else 0.0
        normalized = round((got / c.max_marks) * 100, 2) if c.max_marks else 0
        out.append({
            "code": c.code, "label": c.label,
            "obtained": obtained, "max": c.max_marks,
            "normalizedPercent": normalized,
        })
    return {
        "courseId": course.id,
        "courseCode": course.course_code,
        "courseName": course.course_name,
        "components": out,
    }


def domain_radar(db: Session, student_id: str) -> dict:
    """Average normalized performance per DOMAIN across the student's subjects.
    Uses the CourseDomain mapping. Ready for a radar/spider chart."""
    data = compute_student_cgpa(db, student_id)
    subj_pct = {}
    for sem in data["semesters"]:
        for subj in sem["subjects"]:
            subj_pct[subj["course_id"]] = subj["percentage"]

    domain_scores = {}
    links = db.query(CourseDomain).filter(CourseDomain.course_id.in_(list(subj_pct.keys()))).all() if subj_pct else []
    for link in links:
        domain_scores.setdefault(link.domain_id, []).append(subj_pct[link.course_id])

    axes = []
    for domain_id, pcts in domain_scores.items():
        domain = db.query(Domain).filter(Domain.id == domain_id).first()
        axes.append({
            "domain": domain.name if domain else domain_id,
            "averagePercent": round(sum(pcts) / len(pcts), 2),
            "subjectCount": len(pcts),
        })

    return {"studentId": student_id, "axes": axes}