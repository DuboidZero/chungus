import uuid
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from app.database import Base, TimestampMixin


class SubjectTeacher(Base, TimestampMixin):
    """Relationship A: a teacher teaches a specific course to a specific division.
    e.g. 'Teacher A teaches Maths (CSE Sem 3) to CSE-B'.
    Grants the teacher an academics-only view of students in that division."""
    __tablename__ = "subject_teachers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    division_id = Column(String(36), ForeignKey("divisions.id"), nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("teacher_id", "course_id", "division_id", name="uq_subject_teacher"),
    )