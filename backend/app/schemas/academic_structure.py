from pydantic import Field, field_validator
from app.schemas.base import CamelModel


# ============================================================
#  Branch
# ============================================================
class BranchCreate(CamelModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=20)

    @field_validator("name", "code")
    @classmethod
    def _trim(cls, v):
        return v.strip() if isinstance(v, str) else v


class BranchUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    code: str | None = Field(default=None, min_length=2, max_length=20)

    @field_validator("name", "code")
    @classmethod
    def _trim_or_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v


class BranchResponse(CamelModel):
    id: str
    name: str
    code: str


# ============================================================
#  Division
# ============================================================
class DivisionCreate(CamelModel):
    branch_id: str
    name: str = Field(min_length=1, max_length=20)

    @field_validator("name")
    @classmethod
    def _trim(cls, v):
        return v.strip() if isinstance(v, str) else v


class DivisionUpdate(CamelModel):
    branch_id: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=20)

    @field_validator("name")
    @classmethod
    def _trim_or_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v


class DivisionResponse(CamelModel):
    id: str
    branch_id: str
    name: str


# ============================================================
#  Domain
# ============================================================
class DomainCreate(CamelModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("name", "description")
    @classmethod
    def _trim_or_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v


class DomainUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("name", "description")
    @classmethod
    def _trim_or_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v


class DomainResponse(CamelModel):
    id: str
    name: str
    description: str | None


# ============================================================
#  Course (+ domain mapping)
# ============================================================
class CourseDomainLink(CamelModel):
    domain_id: str
    weight: float = 1.0


class CourseCreate(CamelModel):
    branch_id: str
    semester: int = Field(ge=1, le=6)
    course_code: str = Field(min_length=1, max_length=30)
    course_name: str = Field(min_length=2, max_length=200)
    type: str = Field(min_length=2, max_length=10)
    credits: int = Field(ge=0, le=20)
    marking_scheme: str | None = Field(default=None, max_length=100)
    domains: list[CourseDomainLink] = []

    @field_validator("course_code", "course_name", "type", "marking_scheme")
    @classmethod
    def _trim(cls, v):
        return v.strip() if isinstance(v, str) else v

class CourseUpdate(CamelModel):
    branch_id: str | None = None
    semester: int | None = Field(default=None, ge=1, le=6)
    course_code: str | None = Field(default=None, min_length=1, max_length=30)
    course_name: str | None = Field(default=None, min_length=2, max_length=200)
    type: str | None = Field(default=None, min_length=2, max_length=10)
    credits: int | None = Field(default=None, ge=0, le=20)
    marking_scheme: str | None = Field(default=None, max_length=100)

    @field_validator("course_code", "course_name", "type", "marking_scheme")
    @classmethod
    def _trim_or_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v


class CourseResponse(CamelModel):
    id: str
    branch_id: str
    semester: int
    course_code: str
    course_name: str
    type: str
    credits: int
    marking_scheme: str | None


class CourseDomainResponse(CamelModel):
    id: str
    course_id: str
    domain_id: str
    weight: float