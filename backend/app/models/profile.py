import uuid
from sqlalchemy import Column, String, ForeignKey
from app.database import Base, TimestampMixin


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)

    avatar = Column(String, nullable=True)
    about_me = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    internship_preference = Column(String, default="none", nullable=False)
    preferred_radius = Column(String, nullable=True)