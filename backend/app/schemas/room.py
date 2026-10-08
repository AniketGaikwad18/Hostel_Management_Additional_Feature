from pydantic import BaseModel
from typing import Optional, List

class BedOut(BaseModel):
    id: str
    bed_number: str
    is_occupied: bool
    student_id: Optional[str] = None
    student_name: Optional[str] = None

class RoomOut(BaseModel):
    id: str
    block_id: str
    block_name: str
    floor_number: int
    room_number: str
    capacity: int
    occupied_count: int
    status: str  # AVAILABLE, FULL, MAINTENANCE
    beds: List[BedOut] = []

class RoomAllocateRequest(BaseModel):
    student_id: str
    bed_id: Optional[str] = None

class BlockSummaryOut(BaseModel):
    id: str
    name: str
    total_rooms: int
    occupied_rooms: int
    available_beds: int
