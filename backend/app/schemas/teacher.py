from datetime import datetime, date as date_type
from enum import Enum
from app.schemas.base import CamelModel


# ============================================================
#  Private Notes
# ============================================================
class NoteCreate(CamelModel):
    content: str


class NoteUpdate(CamelModel):
    content: str


class NoteResponse(CamelModel):
    id: str
    student_id: str
    teacher_id: str
    teacher_name: str | None
    content: str
    created_at: datetime
    updated_at: datetime


# ============================================================
#  Assessment Marks
# ============================================================
class MarkCreate(CamelModel):
    assessment_title: str
    score: float
    max_score: float
    comments: str | None = None
    date: date_type | None = None


class MarkResponse(CamelModel):
    id: str
    student_id: str
    project_id: str | None
    assessment_title: str
    score: float
    max_score: float
    comments: str | None
    teacher_id: str
    teacher_name: str | None
    date: date_type | None
    created_at: datetime
    updated_at: datetime


# ============================================================
#  Project Milestones
# ============================================================
class MilestoneStatus(str, Enum):
    on_track = "On Track"
    delayed = "Delayed"
    completed = "Completed"


class MilestoneCreate(CamelModel):
    description: str
    status: MilestoneStatus
    date: date_type | None = None


class MilestoneResponse(CamelModel):
    id: str
    project_id: str
    description: str
    status: str
    date: date_type | None
    created_at: datetime
    updated_at: datetime

class GuidanceCaseCreate(CamelModel):
    student_id: str
    trigger_signal: str | None = None


class GuidanceCaseUpdate(CamelModel):
    status: str | None = None
    resolution_note: str | None = None


class GuidanceCaseResponse(CamelModel):
    id: str
    student_id: str
    owning_teacher_id: str | None
    trigger_signal: str | None
    status: str
    resolution_note: str | None
    date_opened: date_type | None
    date_resolved: date_type | None
    created_at: datetime
    updated_at: datetime