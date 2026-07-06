from pydantic import Field, field_validator
from app.schemas.base import CamelModel


# ============================================================
#  Scheme Component (nested inside a scheme)
# ============================================================
class ComponentCreate(CamelModel):
    code: str = Field(min_length=1, max_length=20)
    label: str | None = Field(default=None, max_length=120)
    max_marks: float = Field(gt=0)
    min_marks: float | None = Field(default=None, ge=0)
    display_order: int = 0

    @field_validator("code")
    @classmethod
    def _trim(cls, v):
        return v.strip() if isinstance(v, str) else v


class ComponentResponse(CamelModel):
    id: str
    code: str
    label: str | None
    max_marks: float
    min_marks: float | None
    display_order: int


# ============================================================
#  Marking Scheme
# ============================================================
class SchemeCreate(CamelModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    components: list[ComponentCreate] = Field(min_length=1)

    @field_validator("name")
    @classmethod
    def _trim(cls, v):
        return v.strip() if isinstance(v, str) else v


class SchemeUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    components: list[ComponentCreate] | None = None


class SchemeResponse(CamelModel):
    id: str
    name: str
    description: str | None
    components: list[ComponentResponse]