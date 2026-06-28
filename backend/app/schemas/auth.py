from pydantic import BaseModel


class LoginRequest(BaseModel):
    prn: str
    password: str


class UserResponse(BaseModel):
    id: str
    prn: str | None
    email: str | None
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: UserResponse
    accessToken: str