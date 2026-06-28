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