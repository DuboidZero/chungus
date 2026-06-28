import uuid
from sqlalchemy import Column, String, Date, ForeignKey
from app.database import Base, TimestampMixin


class Experience(Base, TimestampMixin):
    __tablename__ = "experiences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    organisation_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)        # null = currently working (per contract)
    description = Column(String, nullable=True)
    type = Column(String, nullable=False)          # Internship / Part-time / Full-time