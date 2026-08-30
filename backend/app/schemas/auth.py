from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    name: str | None = None
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    created_at: str | None = None

class AuthResponse(BaseModel):
    user: UserOut
    accessToken: str
