from pydantic import Field
from app.schemas.base import CamelModel


class TeacherBranchAssign(CamelModel):
    branch_id: str


class SubjectTeacherCreate(CamelModel):
    teacher_id: str
    course_id: str
    division_id: str


class SubjectTeacherResponse(CamelModel):
    id: str
    teacher_id: str
    teacher_name: str | None
    course_id: str
    course_code: str | None
    course_name: str | None
    division_id: str
    division_name: str | None


class MentorChoose(CamelModel):
    mentor_id: str


class TeacherBrief(CamelModel):
    id: str
    name: str | None
    email: str | None
    department: str | None