import uuid
from sqlalchemy import Column, String, Boolean
from app.database import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    role = Column(String, nullable=False)
    name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    academic_year = Column(String, nullable=True)   # FY / SY / TY / Final Year
    batch = Column(String, nullable=True)            # e.g. "2022-2026"
    prn = Column(String, unique=True, nullable=True, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    hashed_password = Column(String, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)