import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from app.database import Base, TimestampMixin


class TechnicalSkill(Base, TimestampMixin):
    __tablename__ = "technical_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    domain = Column(String, nullable=False)        # e.g. "Web Development"
    name = Column(String, nullable=False)          # e.g. "React"
    proficiency = Column(Integer, nullable=False)  # Likert 1-5 (number)


class SoftSkill(Base, TimestampMixin):
    __tablename__ = "soft_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)          # e.g. "Leadership"
    proficiency = Column(Integer, nullable=True)   # optional number


class Language(Base, TimestampMixin):
    __tablename__ = "languages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)          # e.g. "English"
    proficiency = Column(String, nullable=False)   # text: "Basic"/"Fluent"/etc.