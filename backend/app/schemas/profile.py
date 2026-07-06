from datetime import datetime
from pydantic import Field, field_validator
from app.schemas.base import CamelModel


class ProfileResponse(CamelModel):
    id: str
    user_id: str
    avatar: str | None = Field(default=None, serialization_alias="avatarUrl")
    about_me: str | None
    email: str | None
    phone: str | None
    location: str | None
    internship_preference: str
    preferred_radius: str | None
    domain_interest: str | None   
    best_five_subjects: str | None     
    created_at: datetime
    updated_at: datetime

    @field_validator("about_me", "phone", "location", "preferred_radius", "email", "domain_interest", mode="before")
    @classmethod
    def none_to_empty(cls, v):
        return v if v is not None else ""


class ProfileUpdate(CamelModel):
    avatar: str | None = Field(default=None, validation_alias="avatarUrl")
    about_me: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    internship_preference: str | None = None
    preferred_radius: str | None = None
    domain_interest: str | None