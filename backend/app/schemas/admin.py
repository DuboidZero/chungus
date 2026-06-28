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