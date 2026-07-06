"""
Phase 2 test seed — complete known scenario for testing the marks engine.
Creates CSE branch, CSE-A division, a marking scheme, Operating Systems course
linked to it, and 2 students. Safe to re-run.
"""
import app.models  # register all tables
from app.database import SessionLocal
from app.models.user import User
from app.models.academic_structure import Branch, Division, Course
from app.models.marks import MarkingScheme, SchemeComponent
from app.core.security import hash_password


def get_or_create(db, model, defaults=None, **kwargs):
    obj = db.query(model).filter_by(**kwargs).first()
    if obj:
        return obj, False
    params = {**kwargs, **(defaults or {})}
    obj = model(**params)
    db.add(obj)
    db.flush()
    return obj, True


def run():
    db = SessionLocal()
    try:
        branch, _ = get_or_create(db, Branch, name="Computer Science Engineering", code="CSE")
        division, _ = get_or_create(db, Division, branch_id=branch.id, name="A")

        scheme = db.query(MarkingScheme).filter_by(name="Theory + Lab + SLA").first()
        if not scheme:
            scheme = MarkingScheme(name="Theory + Lab + SLA", description="Full: theory + practical + self-learning")
            db.add(scheme); db.flush()
            comps = [
                ("CCA-TH", "Class Continuous Assessment (Theory)", 30, None, 1),
                ("ETE-TH", "End Term Exam (Theory)", 70, 28, 2),
                ("LCA-PR", "Lab Continuous Assessment", 25, 10, 3),
                ("ETE-PR", "End Term Practical", 25, 10, 4),
                ("SLA", "Self Learning Assessment", 25, 10, 5),
            ]
            for code, label, mx, mn, order in comps:
                db.add(SchemeComponent(scheme_id=scheme.id, code=code, label=label,
                                       max_marks=mx, min_marks=mn, display_order=order))
            db.flush()

        course, _ = get_or_create(
            db, Course,
            branch_id=branch.id, course_code="CSE00350",
            defaults=dict(semester=3, course_name="Operating Systems", type="DSC",
                          credits=4, marking_scheme="Theory + Lab + SLA",
                          marking_scheme_id=scheme.id),
        )
        if course.marking_scheme_id != scheme.id:
            course.marking_scheme_id = scheme.id

        students = [
            ("1032230001", "Aarav Sharma", "aara2005"),
            ("1032230002", "Diya Patel", "diya2005"),
        ]
        for prn, name, pwd in students:
            if not db.query(User).filter(User.prn == prn).first():
                db.add(User(role="student", prn=prn, name=name,
                            department="Computer Science Engineering",
                            batch="2023-2027", current_semester=3,
                            division_id=division.id,
                            hashed_password=hash_password(pwd),
                            must_change_password=False, is_active=True))

        db.commit()
        print("=== TEST SEED DONE ===")
        print(f"Branch:   {branch.name} ({branch.code})  id={branch.id}")
        print(f"Division: CSE-A  id={division.id}")
        print(f"Scheme:   {scheme.name}  id={scheme.id}")
        print(f"Course:   Operating Systems (CSE00350)  id={course.id}  credits=4")
        print("Students: 1032230001 (Aarav), 1032230002 (Diya)")
    finally:
        db.close()


if __name__ == "__main__":
    run()