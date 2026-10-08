from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "NORMAL"  # NORMAL, IMPORTANT, CRITICAL
    target_audience: str = "ALL"

class AnnouncementOut(BaseModel):
    id: str
    title: str
    content: str
    priority: str
    target_audience: str
    created_at: datetime
    warden_name: Optional[str] = None

class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

class EmergencyAlertCreate(BaseModel):
    location: str
    message: str

class EmergencyAlertOut(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_code: str
    room_number: Optional[str] = None
    location: str
    message: str
    status: str
    created_at: datetime

class LeaveRequestCreate(BaseModel):
    start_date: datetime
    end_date: datetime
    destination: str
    reason: str

class LeaveRequestOut(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_code: str
    room_number: Optional[str] = None
    start_date: datetime
    end_date: datetime
    destination: str
    reason: str
    status: str  # PENDING, APPROVED, REJECTED
    created_at: datetime
