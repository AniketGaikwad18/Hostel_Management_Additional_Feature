import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.errors import unauthorized_error, forbidden_error

security_scheme = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise unauthorized_error("Could not validate credentials or token expired")

def get_current_user_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    if not credentials:
        raise unauthorized_error("Missing authorization bearer token")
    return decode_access_token(credentials.credentials)

def require_warden(payload: Dict[str, Any] = Depends(get_current_user_payload)) -> Dict[str, Any]:
    role = payload.get("role")
    if role not in ["WARDEN", "ADMIN"]:
        raise forbidden_error("Access restricted to Hostel Wardens and Administrators.")
    return payload

def require_student(payload: Dict[str, Any] = Depends(get_current_user_payload)) -> Dict[str, Any]:
    role = payload.get("role")
    if role != "STUDENT":
        raise forbidden_error("Access restricted to Hostel Students.")
    return payload
