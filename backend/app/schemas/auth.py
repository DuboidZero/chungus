from app.schemas.base import CamelModel


class LoginRequest(CamelModel):
    prn: str
    password: str


class UserResponse(CamelModel):
    id: str
    prn: str | None
    email: str | None
    role: str


class LoginResponse(CamelModel):
    user: UserResponse
    access_token: str
    must_change_password: bool

class ChangePasswordRequest(CamelModel):
    current_password: str
    new_password: str