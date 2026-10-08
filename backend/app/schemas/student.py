from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StudentOut(BaseModel):
    id: str
    user_id: str
    student_code: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    course: str
    year_of_study: int
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    current_status: str
    last_entry_at: Optional[datetime] = None
    last_exit_at: Optional[datetime] = None
    hostel_name: Optional[str] = None
    block_name: Optional[str] = None
    room_number: Optional[str] = None
    bed_number: Optional[str] = None

class StudentDetailOut(StudentOut):
    pending_complaints_count: int = 0
    total_fines_amount: float = 0.0
    outstanding_fee_amount: float = 0.0
    recent_logs: List[dict] = []
