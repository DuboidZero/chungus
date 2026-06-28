from app.schemas.base import CamelModel


class DashboardStats(CamelModel):
    cgpa: float
    project_count: int
    achievement_count: int
    skill_count: int


class CgpaTrendPoint(CamelModel):
    semester: str
    cgpa: float


class DashboardResponse(CamelModel):
    stats: DashboardStats
    cgpa_trend: list[CgpaTrendPoint]
    upcoming_deadlines: list = []