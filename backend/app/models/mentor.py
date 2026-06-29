import uuid
from sqlalchemy import Column, String, ForeignKey
from app.database import Base, TimestampMixin


class MentorAssignment(Base, TimestampMixin):
    __tablename__ = "mentor_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)