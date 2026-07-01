from app.schemas.base import CamelModel


class SeededStudent(CamelModel):
    prn: str
    full_name: str
    initial_password: str   # returned once so admin can distribute it


class BulkUploadResult(CamelModel):
    created: int
    skipped: int
    errors: list[str]
    students: list[SeededStudent]

class TeacherCreate(CamelModel):
    email: str
    full_name: str
    password: str


class UserSummary(CamelModel):
    id: str
    prn: str | None
    email: str | None
    role: str
    is_active: bool
    must_change_password: bool

class MentorAssignmentRequest(CamelModel):
    teacher_id: str
    student_id: str


class MentorAssignmentResponse(CamelModel):
    id: str
    teacher_id: str
    student_id: str


from pydantic import Field, field_validator


class AdminUserUpdate(CamelModel):
    """PATCH /admin/users/:id — all fields optional."""
    name: str | None = Field(default=None, min_length=2, max_length=120)
    email: str | None = Field(default=None, max_length=120)
    department: str | None = Field(default=None, max_length=100)
    academic_year: str | None = Field(default=None, max_length=20)
    batch: str | None = Field(default=None, max_length=20)

    @field_validator("name", "department", "academic_year", "batch")
    @classmethod
    def _trim_or_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v):
        if v and v.strip():
            v = v.strip()
            if "@" not in v or "." not in v.split("@")[-1]:
                raise ValueError("Invalid email format")
            return v
        return None


class AdminUserResponse(CamelModel):
    id: str
    prn: str | None
    name: str | None
    email: str | None
    role: str
    department: str | None
    is_active: bool
    must_change_password: bool


class ResetPasswordResponse(CamelModel):
    id: str
    temporary_password: str   # shown once so admin can hand it over
    first_login: bool


class ToggleStatusResponse(CamelModel):
    id: str
    deactivated: bool