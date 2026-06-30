from enum import Enum
from datetime import date as date_type, datetime
from app.schemas.base import CamelModel
from pydantic import field_validator


class AchievementCategory(str, Enum):
    academic = "Academic"
    co_curricular = "Co-curricular"
    sports = "Sports"
    technical = "Technical"
    cultural = "Cultural"
    other = "Other"


class AchievementType(str, Enum):
    competition = "Competition"
    hackathon = "Hackathon"
    award = "Award"
    certification = "Certification"
    publication = "Publication"
    other = "Other"


class AchievementLevel(str, Enum):
    college = "College"
    state = "State"
    national = "National"
    international = "International"


def _coerce_month_to_date(v):
    """Frontend <input type='month'> sends 'YYYY-MM'; make it a full date 'YYYY-MM-01'."""
    if isinstance(v, str) and len(v) == 7 and v[4] == "-":
        return v + "-01"
    return v


class AchievementCreate(CamelModel):
    title: str
    description: str | None = None
    category: AchievementCategory
    type: AchievementType
    level: AchievementLevel
    date: date_type | None = None
    certificate_url: str | None = None

    @field_validator("date", mode="before")
    @classmethod
    def coerce_date(cls, v):
        return _coerce_month_to_date(v)


class AchievementUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    category: AchievementCategory | None = None
    type: AchievementType | None = None
    level: AchievementLevel | None = None
    date: date_type | None = None
    certificate_url: str | None = None

    @field_validator("date", mode="before")
    @classmethod
    def coerce_date(cls, v):
        return _coerce_month_to_date(v)


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