from app.schemas.base import CamelModel


# --- Technical ---
class TechnicalSkillCreate(CamelModel):
    domain: str
    name: str
    proficiency: int


class TechnicalSkillResponse(CamelModel):
    id: str
    domain: str
    name: str
    proficiency: int


# --- Soft ---
class SoftSkillCreate(CamelModel):
    name: str
    proficiency: int | None = None


class SoftSkillResponse(CamelModel):
    id: str
    name: str
    proficiency: int | None


# --- Languages ---
class LanguageCreate(CamelModel):
    name: str
    proficiency: str


class LanguageResponse(CamelModel):
    id: str
    name: str
    proficiency: str


# --- Combined response for GET /me/skills ---
class SkillsResponse(CamelModel):
    technical: list[TechnicalSkillResponse]
    soft: list[SoftSkillResponse]
    languages: list[LanguageResponse]