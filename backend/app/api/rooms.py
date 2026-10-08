import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.database import models
from app.schemas.room import RoomOut, BedOut, RoomAllocateRequest, BlockSummaryOut
from app.schemas.common import StandardResponse
from app.core.security import require_warden, get_current_user_payload
from app.core.errors import not_found_error, room_full_error, student_not_found_error

router = APIRouter(prefix="/rooms", tags=["Rooms & Allocations"])

@router.get("", response_model=StandardResponse[List[RoomOut]])
def list_rooms(
    block_name: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Room)
    if block_name:
        query = query.join(models.Block).filter(models.Block.name.ilike(f"%{block_name}%"))
    if status:
        query = query.filter(models.Room.status == status.upper())

    rooms = query.order_by(models.Room.room_number).all()
    results = []

    for r in rooms:
        beds_out = []
        for b in r.beds:
            active_alloc = db.query(models.RoomAllocation).filter(
                models.RoomAllocation.bed_id == b.id,
                models.RoomAllocation.is_active == True
            ).first()
            s_id = active_alloc.student_id if active_alloc else None
            s_name = active_alloc.student.user.full_name if active_alloc and active_alloc.student else None

            beds_out.append(BedOut(
                id=b.id,
                bed_number=b.bed_number,
                is_occupied=b.is_occupied,
                student_id=s_id,
                student_name=s_name
            ))

        results.append(RoomOut(
            id=r.id,
            block_id=r.block_id,
            block_name=r.block.name if r.block else "Main Block",
            floor_number=r.floor.floor_number if r.floor else 1,
            room_number=r.room_number,
            capacity=r.capacity,
            occupied_count=r.occupied_count,
            status=r.status,
            beds=beds_out
        ))

    return StandardResponse(success=True, data=results)

@router.post("/{room_id}/allocate", response_model=StandardResponse[dict])
def allocate_room(
    room_id: str,
    req: RoomAllocateRequest,
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise not_found_error("Room")

    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    if not student:
        raise student_not_found_error()

    if room.occupied_count >= room.capacity:
        raise room_full_error("This room is already at full capacity.")

    # Find available bed
    if req.bed_id:
        bed = db.query(models.Bed).filter(models.Bed.id == req.bed_id, models.Bed.room_id == room.id).first()
        if not bed or bed.is_occupied:
            raise room_full_error("Specified bed is not available.")
    else:
        bed = db.query(models.Bed).filter(models.Bed.room_id == room.id, models.Bed.is_occupied == False).first()
        if not bed:
            raise room_full_error("No available beds in this room.")

    # Deactivate existing student allocation if any
    db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).update({"is_active": False, "vacated_at": datetime.now(timezone.utc)})

    # Assign new
    bed.is_occupied = True
    room.occupied_count += 1
    if room.occupied_count >= room.capacity:
        room.status = "FULL"

    alloc = models.RoomAllocation(
        id=str(uuid.uuid4()),
        student_id=student.id,
        room_id=room.id,
        bed_id=bed.id,
        allocated_at=datetime.now(timezone.utc),
        is_active=True
    )
    db.add(alloc)
    db.commit()

    return StandardResponse(
        success=True,
        data={
            "student_id": student.id,
            "room_number": room.room_number,
            "bed_number": bed.bed_number
        },
        message=f"Student {student.user.full_name} successfully allocated to {room.room_number} ({bed.bed_number})"
    )

@router.post("/{room_id}/vacate", response_model=StandardResponse[dict])
def vacate_room(
    room_id: str,
    req: RoomAllocateRequest,
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise not_found_error("Room")

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.room_id == room_id,
        models.RoomAllocation.student_id == req.student_id,
        models.RoomAllocation.is_active == True
    ).first()

    if not alloc:
        raise not_found_error("Active room allocation")

    # Mark vacated
    alloc.is_active = False
    alloc.vacated_at = datetime.now(timezone.utc)
    
    if alloc.bed:
        alloc.bed.is_occupied = False

    room.occupied_count = max(0, room.occupied_count - 1)
    if room.occupied_count < room.capacity:
        room.status = "AVAILABLE"

    db.commit()

    return StandardResponse(
        success=True,
        message=f"Room {room.room_number} successfully vacated for student"
    )
