from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MovementActionRequest(BaseModel):
    student_id: str
    gate: Optional[str] = "MAIN_GATE_1"
    device_info: Optional[str] = "Warden Terminal / Scanner"
    remarks: Optional[str] = None

class MovementLogOut(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    room_number: Optional[str] = None
    block_name: Optional[str] = None
    action: str  # ENTRY, EXIT
    timestamp: datetime
    gate: str
    device_info: Optional[str] = None
    remarks: Optional[str] = None
    warden_name: Optional[str] = None

class MovementResultOut(BaseModel):
    log_id: str
    student_id: str
    student_name: str
    action: str
    timestamp: datetime
    current_status: str
    message: str
