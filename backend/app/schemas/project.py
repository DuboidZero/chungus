from enum import Enum
from datetime import date as date_type, datetime
from app.schemas.base import CamelModel
from pydantic import field_validator


class ProjectType(str, Enum):
    college = "College Project"
    personal = "Personal Project"
    internship = "Internship Project"


class ProjectStatus(str, Enum):
    ongoing = "Ongoing"
    completed = "Completed"


def _coerce_month_to_date(v):
    """Frontend <input type='month'> sends 'YYYY-MM'; make it a full date 'YYYY-MM-01'."""
    if isinstance(v, str) and len(v) == 7 and v[4] == "-":
        return v + "-01"
    return v


class ProjectCreate(CamelModel):
    name: str
    description: str | None = None
    domain: str | None = None
    tech_stack: list[str] = []
    image_url: str | None = None
    type: ProjectType
    mentor_name: str | None = None
    status: ProjectStatus
    start_date: date_type | None = None
    end_date: date_type | None = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def coerce_dates(cls, v):
        return _coerce_month_to_date(v)


class ProjectUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    domain: str | None = None
    tech_stack: list[str] | None = None
    image_url: str | None = None
    type: ProjectType | None = None
    mentor_name: str | None = None
    status: ProjectStatus | None = None
    start_date: date_type | None = None
    end_date: date_type | None = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def coerce_dates(cls, v):
        return _coerce_month_to_date(v)


class ProjectResponse(CamelModel):
    id: str
    name: str
    description: str | None
    domain: str | None
    tech_stack: list[str]
    image_url: str | None
    type: str
    mentor_name: str | None
    status: str
    start_date: date_type | None
    end_date: date_type | None
    github_repo: str | None
    created_at: datetime
    updated_at: datetime