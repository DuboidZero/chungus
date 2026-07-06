from enum import Enum
from datetime import date as date_type, datetime
from app.schemas.base import CamelModel
from pydantic import field_validator


class ExperienceType(str, Enum):
    internship = "Internship"
    part_time = "Part-time"
    full_time = "Full-time"


def _coerce_month_to_date(v):
    """Frontend <input type='month'> sends 'YYYY-MM'; make it a full date 'YYYY-MM-01'."""
    if isinstance(v, str) and len(v) == 7 and v[4] == "-":
        return v + "-01"
    return v


class ExperienceCreate(CamelModel):
    organisation_name: str
    role: str
    start_date: date_type | None = None
    end_date: date_type | None = None
    description: str | None = None
    type: ExperienceType
    is_paid: str | None = None
    supervisor_contact: str | None = None
    faculty_guide: str | None = None
    work_model: str | None = None
    reflection: str | None = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def coerce_dates(cls, v):
        return _coerce_month_to_date(v)


class ExperienceUpdate(CamelModel):
    organisation_name: str | None = None
    role: str | None = None
    start_date: date_type | None = None
    end_date: date_type | None = None
    description: str | None = None
    type: ExperienceType | None = None
    is_paid: str | None = None
    supervisor_contact: str | None = None
    faculty_guide: str | None = None
    work_model: str | None = None
    reflection: str | None = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def coerce_dates(cls, v):
        return _coerce_month_to_date(v)


class ExperienceResponse(CamelModel):
    id: str
    organisation_name: str
    role: str
    start_date: date_type | None
    end_date: date_type | None
    description: str | None
    type: str
    is_paid: str | None = None
    supervisor_contact: str | None = None
    faculty_guide: str | None = None
    work_model: str | None = None
    reflection: str | None = None
    created_at: datetime
    updated_at: datetime