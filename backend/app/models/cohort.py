import uuid
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from app.database import Base, TimestampMixin


class Cohort(Base, TimestampMixin):
    __tablename__ = "cohorts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    academic_year = Column(String, nullable=False)   # FY / SY / TY / Final Year
    department = Column(String, nullable=False)
    mentor_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)

    # A cohort is uniquely identified by (academic_year + department)
    __table_args__ = (
        UniqueConstraint("academic_year", "department", name="uq_cohort_year_dept"),
    )