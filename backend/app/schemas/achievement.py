from enum import Enum
from datetime import date as date_type, datetime
from app.schemas.base import CamelModel


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


class AchievementCreate(CamelModel):
    title: str
    description: str | None = None
    category: AchievementCategory
    type: AchievementType
    level: AchievementLevel
    date: date_type | None = None
    certificate_url: str | None = None


class AchievementUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    category: AchievementCategory | None = None
    type: AchievementType | None = None
    level: AchievementLevel | None = None
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