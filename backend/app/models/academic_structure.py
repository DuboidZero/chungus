import uuid
from sqlalchemy import Column, Integer, Float, String, ForeignKey, UniqueConstraint
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

class Course(Base, TimestampMixin):
    """Course catalog entry — one row per course per branch per semester.
    Renamed from the PRD's 'Subject' to avoid colliding with the existing
    per-student Subject model in academic.py (legacy manual grade entries)."""
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), nullable=False, index=True)
    semester = Column(Integer, nullable=False)          # 1-6
    course_code = Column(String, nullable=False)
    course_name = Column(String, nullable=False)
    type = Column(String, nullable=False)                # DSC / SEC / VEC / AEC
    credits = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("branch_id", "course_code", name="uq_course_branch_code"),
    )


class CourseDomain(Base, TimestampMixin):
    """Maps a Course to one or more Domains, with a configurable weight
    (PRD: 'a subject can belong to multiple domains with configurable weights')."""
    __tablename__ = "course_domains"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    domain_id = Column(String(36), ForeignKey("domains.id"), nullable=False, index=True)
    weight = Column(Float, nullable=False, default=1.0)

    __table_args__ = (
        UniqueConstraint("course_id", "domain_id", name="uq_coursedomain_course_domain"),
    )