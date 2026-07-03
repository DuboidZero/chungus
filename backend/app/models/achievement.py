import uuid
from sqlalchemy import Column, String, Date, ForeignKey
from app.database import Base, TimestampMixin


class Achievement(Base, TimestampMixin):
    __tablename__ = "achievements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=False)      # Academic / Technical / Sports / etc.
    type = Column(String, nullable=False)          # Competition / Hackathon / Award / etc.
    level = Column(String, nullable=False)         # College / State / National / International
    date = Column(Date, nullable=True)
    certificate_url = Column(String, nullable=True)