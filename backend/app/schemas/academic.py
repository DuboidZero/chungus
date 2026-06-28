from datetime import datetime
from app.schemas.base import CamelModel


# --- Subject shapes ---
class SubjectCreate(CamelModel):
    name: str
    marks_obtained: float | None = None
    max_marks: float | None = None
    grade: str | None = None
    credits: int


class SubjectResponse(CamelModel):
    id: str
    name: str
    marks_obtained: float | None
    max_marks: float | None
    grade: str | None
    credits: int


# --- Semester shapes ---
class SemesterCreate(CamelModel):
    semester_number: int
    subjects: list[SubjectCreate]


class SemesterResponse(CamelModel):
    id: str
    semester_number: int
    gpa: float            # computed
    total_credits: int    # computed
    subjects: list[SubjectResponse]
    created_at: datetime
    updated_at: datetime