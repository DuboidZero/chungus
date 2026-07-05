import uuid
from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey
from app.database import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    role = Column(String, nullable=False)
    name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    academic_year = Column(String, nullable=True)   # FY / SY / TY / Final Year — legacy, still used by Cohort/MentorAssignment
    batch = Column(String, nullable=True)            # e.g. "2022-2026"
    prn = Column(String, unique=True, nullable=True, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    hashed_password = Column(String, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # --- Phase 1 additions ---
    current_semester = Column(Integer, nullable=True)          # 1-6, replaces academic_year going forward
    division_id = Column(String(36), ForeignKey("divisions.id"), nullable=True, index=True)
    cgpa = Column(Float, nullable=True)                         # computed and cached, see Phase 2