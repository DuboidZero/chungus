from datetime import date as date_type, datetime
from app.schemas.base import CamelModel


class ExperienceCreate(CamelModel):
    organisation_name: str
    role: str
    start_date: date_type | None = None
    end_date: date_type | None = None
    description: str | None = None
    type: str


class ExperienceUpdate(CamelModel):
    organisation_name: str | None = None
    role: str | None = None
    start_date: date_type | None = None
    end_date: date_type | None = None
    description: str | None = None
    type: str | None = None


class ExperienceResponse(CamelModel):
    id: str
    organisation_name: str
    role: str
    start_date: date_type | None
    end_date: date_type | None
    description: str | None
    type: str
    created_at: datetime
    updated_at: datetime