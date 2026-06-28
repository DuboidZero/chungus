import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey
from app.database import Base, TimestampMixin
from sqlalchemy.orm import relationship


class Semester(Base, TimestampMixin):
    __tablename__ = "semesters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    semester_number = Column(Integer, nullable=False)
    subjects = relationship("Subject", cascade="all, delete-orphan")
    # gpa and total_credits are COMPUTED, not stored — so they never drift


class Subject(Base, TimestampMixin):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    semester_id = Column(String(36), ForeignKey("semesters.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    marks_obtained = Column(Float, nullable=True)
    max_marks = Column(Float, nullable=True)
    grade = Column(String, nullable=True)        # letter grade (O, A+, A, ...)
    credits = Column(Integer, nullable=False)