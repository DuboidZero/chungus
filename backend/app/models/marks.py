import uuid
from sqlalchemy import Column, Integer, Float, String, ForeignKey, UniqueConstraint
from app.database import Base, TimestampMixin


class MarkingScheme(Base, TimestampMixin):
    """A reusable marking-scheme template, e.g. 'Theory + Practical + SLA'.
    Defined once by the admin, then assigned to many Courses (PRD D3).
    The set of components that make up the scheme live in SchemeComponent."""
    __tablename__ = "marking_schemes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)


class SchemeComponent(Base, TimestampMixin):
    """One component of a marking scheme, e.g. CCA-TH (max 30), ETE-TH (max 70).
    max_marks = the fixed maximum (what it is out of AND counts for -- MIT WPU
    conducts each component out of exactly what it counts for, so no scaling)."""
    __tablename__ = "scheme_components"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    scheme_id = Column(String(36), ForeignKey("marking_schemes.id"), nullable=False, index=True)
    code = Column(String, nullable=False)
    label = Column(String, nullable=True)
    max_marks = Column(Float, nullable=False)
    min_marks = Column(Float, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint("scheme_id", "code", name="uq_component_scheme_code"),
    )


class MarksEntry(Base, TimestampMixin):
    """A single student's obtained mark for ONE component of ONE course.
    Raw marks only -- subject total, percentage, grade, and GPA are all
    COMPUTED from these rows by the grading code (never stored redundantly)."""
    __tablename__ = "marks_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    component_id = Column(String(36), ForeignKey("scheme_components.id"), nullable=False, index=True)
    obtained_marks = Column(Float, nullable=True)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", "component_id", name="uq_mark_student_course_component"),
    )