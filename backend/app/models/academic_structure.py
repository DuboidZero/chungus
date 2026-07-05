import uuid
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from app.database import Base, TimestampMixin


class Branch(Base, TimestampMixin):
    """e.g. Computer Science Engineering (code: CSE), Mechanical (code: MECH)."""
    __tablename__ = "branches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False, unique=True)
    code = Column(String, nullable=False, unique=True)


class Division(Base, TimestampMixin):
    """e.g. CSE-A, CSE-B. Always belongs to exactly one Branch."""
    __tablename__ = "divisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), nullable=False, index=True)
    name = Column(String, nullable=False)   # e.g. "A", "B"

    __table_args__ = (
        UniqueConstraint("branch_id", "name", name="uq_division_branch_name"),
    )

class Domain(Base, TimestampMixin):
    """Competency domain, e.g. AI/ML, CyberSec, DSA/Backend. Admin-managed master list."""
    __tablename__ = "domains"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)