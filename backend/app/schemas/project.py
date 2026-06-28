from datetime import date as date_type, datetime
from app.schemas.base import CamelModel


class ProjectCreate(CamelModel):
    name: str
    description: str | None = None
    domain: str | None = None
    tech_stack: list[str] = []
    image_url: str | None = None
    type: str
    mentor_name: str | None = None
    status: str
    start_date: date_type | None = None
    end_date: date_type | None = None


class ProjectUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    domain: str | None = None
    tech_stack: list[str] | None = None
    image_url: str | None = None
    type: str | None = None
    mentor_name: str | None = None
    status: str | None = None
    start_date: date_type | None = None
    end_date: date_type | None = None


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