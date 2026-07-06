import uuid
from sqlalchemy import Column, String, Text
from app.database import Base, TimestampMixin


class AuditLog(Base, TimestampMixin):
    """Records significant admin/system actions for traceability (Phase 6)."""
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    actor_id = Column(String(36), nullable=True, index=True)
    actor_email = Column(String, nullable=True)
    action = Column(String, nullable=False, index=True)
    target_type = Column(String, nullable=True)
    target_id = Column(String, nullable=True)
    detail = Column(Text, nullable=True)


class CoCurricular(Base, TimestampMixin):
    """Clubs, associations, and event roles a student holds (Phase 6)."""
    __tablename__ = "co_curriculars"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), nullable=False, index=True)
    organisation = Column(String, nullable=False)
    role = Column(String, nullable=True)
    activity_type = Column(String, nullable=True)
    description = Column(String, nullable=True)
    academic_year = Column(String, nullable=True)