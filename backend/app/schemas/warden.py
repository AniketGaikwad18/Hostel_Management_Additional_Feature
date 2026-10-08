from pydantic import BaseModel
from typing import List, Optional
from app.schemas.movement import MovementLogOut

class WardenDashboardOut(BaseModel):
    total_students: int
    inside_count: int
    outside_count: int
    available_rooms: int
    total_rooms: int
    pending_complaints: int
    urgent_complaints: int
    outstanding_fees: float
    recent_movements: List[MovementLogOut]
