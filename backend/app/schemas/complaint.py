from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str  # Electrical, Plumbing, Wi-Fi, Cleaning, Furniture, Food, Water, Security, Maintenance, Other
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, URGENT
    photo_url: Optional[str] = None

class ComplaintUpdateStatus(BaseModel):
    status: str  # SUBMITTED, ACKNOWLEDGED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
    assigned_staff: Optional[str] = None
    resolution_notes: Optional[str] = None

class ComplaintUpdateLogOut(BaseModel):
    id: str
    status: str
    comment: Optional[str] = None
    updated_by: str
    created_at: datetime

class ComplaintOut(BaseModel):
    id: str
    complaint_code: str
    student_id: str
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    room_number: Optional[str] = None
    title: str
    description: str
    category: str
    priority: str
    status: str
    assigned_staff: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updates: List[ComplaintUpdateLogOut] = []
