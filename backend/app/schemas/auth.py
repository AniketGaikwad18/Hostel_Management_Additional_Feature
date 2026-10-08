from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    role: str
    full_name: str
    phone: Optional[str] = None
    student_id: Optional[str] = None
    warden_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
