import uuid
from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey
from app.database import Base, TimestampMixin


class PrivateNote(Base, TimestampMixin):
    __tablename__ = "private_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    content = Column(String, nullable=False)

class AssessmentMark(Base, TimestampMixin):
    __tablename__ = "assessment_marks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True, index=True)  # null = general mark
    assessment_title = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    comments = Column(String, nullable=True)
    date = Column(Date, nullable=True)


class ProjectMilestone(Base, TimestampMixin):
    __tablename__ = "project_milestones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    description = Column(String, nullable=False)
    status = Column(String, nullable=False)  # On Track / Delayed / Completed
    date = Column(Date, nullable=True)

class GuidanceCase(Base, TimestampMixin):
    __tablename__ = "guidance_cases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    owning_teacher_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    trigger_signal = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Open")   # Open / Assigned / In Progress / Resolved
    resolution_note = Column(String, nullable=True)
    date_opened = Column(Date, nullable=True)
    date_resolved = Column(Date, nullable=True)