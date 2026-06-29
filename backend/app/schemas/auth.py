from app.schemas.base import CamelModel
from datetime import datetime
from pydantic import Field


class LoginRequest(CamelModel):
    prn: str
    password: str


class UserResponse(CamelModel):
    id: str
    prn: str | None
    name: str | None
    email: str | None
    role: str
    department: str | None
    avatar: str | None = None
    created_at: datetime
    updated_at: datetime


class LoginResponse(CamelModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    must_change_password: bool


class ChangePasswordRequest(CamelModel):
    current_password: str
    new_password: str


class RefreshRequest(CamelModel):
    refresh_token: str


class TokenPairResponse(CamelModel):
    access_token: str
    refresh_token: str