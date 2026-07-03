import uuid
from sqlalchemy import Column, String, Date, ForeignKey, JSON
from app.database import Base, TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    tech_stack = Column(JSON, default=list)        # <-- array stored as JSON
    image_url = Column(String, nullable=True)
    type = Column(String, nullable=False)          # College / Personal / Internship Project
    mentor_name = Column(String, nullable=True)    # required only for College Project (enforced in route)
    status = Column(String, nullable=False)        # Ongoing / Completed
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    github_repo = Column(String, nullable=True)    # Phase 2; null for now