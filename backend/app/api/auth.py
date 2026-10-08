from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.auth import LoginRequest, TokenResponse, UserOut
from app.schemas.common import StandardResponse
from app.core.security import verify_password, create_access_token, get_current_user_payload
from app.core.errors import invalid_credentials_error

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=StandardResponse[TokenResponse])
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise invalid_credentials_error("Invalid username or password")
    
    if not user.is_active:
        raise invalid_credentials_error("User account is inactive")

    student_id = user.student_profile.id if user.student_profile else None
    warden_id = user.warden_profile.id if user.warden_profile else None

    token_data = {
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "student_id": student_id,
        "warden_id": warden_id,
        "full_name": user.full_name
    }
    
    token = create_access_token(token_data)

    user_out = UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        phone=user.phone,
        student_id=student_id,
        warden_id=warden_id
    )

    return StandardResponse(
        success=True,
        data=TokenResponse(access_token=token, token_type="bearer", user=user_out),
        message="Login successful"
    )

@router.post("/logout", response_model=StandardResponse[dict])
def logout(payload: dict = Depends(get_current_user_payload)):
    return StandardResponse(
        success=True,
        data={"logged_out": True},
        message="Logged out successfully"
    )

@router.get("/me", response_model=StandardResponse[UserOut])
def get_me(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise invalid_credentials_error("User not found")

    student_id = user.student_profile.id if user.student_profile else None
    warden_id = user.warden_profile.id if user.warden_profile else None

    user_out = UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        phone=user.phone,
        student_id=student_id,
        warden_id=warden_id
    )

    return StandardResponse(success=True, data=user_out)
