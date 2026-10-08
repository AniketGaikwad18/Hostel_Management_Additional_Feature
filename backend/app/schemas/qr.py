from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QrStudentOut(BaseModel):
    qr_id: str
    student_id: str
    student_name: str
    student_code: str
    hostel_name: str
    block_name: str
    room_number: str
    current_status: str
    secure_token: str
    scan_url: str
    created_at: datetime
    expires_at: datetime
    is_active: bool

class QrValidateRequest(BaseModel):
    token: str

class QrValidatePreviewOut(BaseModel):
    valid: bool
    student_id: str
    student_name: str
    student_code: str
    room_number: str
    block_name: str
    current_status: str
