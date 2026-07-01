from enum import Enum
from datetime import date as date_type, datetime
from app.schemas.base import CamelModel
from app.schemas.validators import non_empty_str, optional_str_trim
from pydantic import Field, field_validator, model_validator


class ProjectType(str, Enum):
    college = "College Project"
    personal = "Personal Project"
    internship = "Internship Project"


class ProjectStatus(str, Enum):
    ongoing = "Ongoing"
    completed = "Completed"


def _coerce_month_to_date(v):
    if isinstance(v, str) and len(v) == 7 and v[4] == "-":
        return v + "-01"
    return v


class ProjectCreate(CamelModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    domain: str | None = Field(default=None, max_length=80)
    tech_stack: list[str] = Field(default=[], max_length=30)
    image_url: str | None = Field(default=None, max_length=500)
    type: ProjectType
    mentor_name: str | None = Field(default=None, max_length=100)
    status: ProjectStatus
    start_date: date_type | None = None
    end_date: date_type | None = None

    _clean_name = non_empty_str("name")
    _clean_optional = optional_str_trim("description", "domain", "mentor_name", "image_url")

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def coerce_dates(cls, v):
        return _coerce_month_to_date(v)

    @field_validator("tech_stack")
    @classmethod
    def clean_tech_stack(cls, v):
        if v is None:
            return []
        cleaned = [t.strip() for t in v if isinstance(t, str) and t.strip()]
        return cleaned

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("endDate cannot be before startDate")
        return self


class ProjectUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    domain: str | None = Field(default=None, max_length=80)
    tech_stack: list[str] | None = Field(default=None, max_length=30)
    image_url: str | None = Field(default=None, max_length=500)
    type: ProjectType | None = None
    mentor_name: str | None = Field(default=None, max_length=100)
    status: ProjectStatus | None = None
    start_date: date_type | None = None
    end_date: date_type | None = None

    _clean_optional = optional_str_trim("description", "domain", "mentor_name", "image_url")

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def coerce_dates(cls, v):
        return _coerce_month_to_date(v)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v):
        if v is not None and not v.strip():
            raise ValueError("name cannot be empty")
        return v.strip() if v else v

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("endDate cannot be before startDate")
        return self

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