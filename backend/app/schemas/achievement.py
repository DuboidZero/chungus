from datetime import date as date_type, datetime
from app.schemas.base import CamelModel


class AchievementCreate(CamelModel):
    title: str
    description: str | None = None
    category: str
    type: str
    level: str
    date: date_type | None = None
    certificate_url: str | None = None


class AchievementUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    type: str | None = None
    level: str | None = None
    date: date_type | None = None
    certificate_url: str | None = None


class AchievementResponse(CamelModel):
    id: str
    title: str
    description: str | None
    category: str
    type: str
    level: str
    date: date_type | None
    certificate_url: str | None
    created_at: datetime
    updated_at: datetime