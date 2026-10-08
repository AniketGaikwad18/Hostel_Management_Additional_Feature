import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.movement import MovementActionRequest, MovementResultOut, MovementLogOut
from app.schemas.common import StandardResponse
from app.core.security import require_warden, get_current_user_payload
from app.core.errors import (
    student_not_found_error,
    already_inside_error,
    already_outside_error,
    forbidden_error
)
from app.core.websocket_hub import ws_hub

router = APIRouter(prefix="/movement", tags=["Hostel Movement"])

@router.post("/entry", response_model=StandardResponse[MovementResultOut])
async def mark_entry(
    req: MovementActionRequest,
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    if not student:
        raise student_not_found_error()

    if student.current_status == "INSIDE":
        raise already_inside_error("Student is already inside.")

    warden_id = payload.get("warden_id")
    now = datetime.now(timezone.utc)

    # Create log
    log = models.EntryExitLog(
        id=str(uuid.uuid4()),
        student_id=student.id,
        warden_id=warden_id,
        action="ENTRY",
        timestamp=now,
        gate=req.gate or "MAIN_GATE_1",
        device_info=req.device_info or "Warden Handheld Reader",
        remarks=req.remarks
    )
    db.add(log)

    # Update student state
    student.current_status = "INSIDE"
    student.last_entry_at = now
    db.commit()
    db.refresh(log)

    # Get active room for broadcast
    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()
    room_number = alloc.room.room_number if alloc and alloc.room else "Unassigned"

    # Compute current inside/outside counts
    inside_count = db.query(models.Student).filter(models.Student.current_status == "INSIDE").count()
    outside_count = db.query(models.Student).filter(models.Student.current_status == "OUTSIDE").count()

    # Real-time WebSocket Broadcast
    await ws_hub.broadcast({
        "type": "MOVEMENT_UPDATE",
        "payload": {
            "log_id": log.id,
            "student_id": student.id,
            "student_name": student.user.full_name,
            "student_code": student.student_code,
            "room_number": room_number,
            "action": "ENTRY",
            "timestamp": now.isoformat(),
            "inside_count": inside_count,
            "outside_count": outside_count,
            "current_status": "INSIDE"
        }
    })

    result = MovementResultOut(
        log_id=log.id,
        student_id=student.id,
        student_name=student.user.full_name,
        action="ENTRY",
        timestamp=now,
        current_status="INSIDE",
        message="Entry recorded successfully."
    )
    return StandardResponse(success=True, data=result, message="Entry recorded successfully")

@router.post("/exit", response_model=StandardResponse[MovementResultOut])
async def mark_exit(
    req: MovementActionRequest,
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    if not student:
        raise student_not_found_error()

    if student.current_status == "OUTSIDE":
        raise already_outside_error("Student is already outside.")

    warden_id = payload.get("warden_id")
    now = datetime.now(timezone.utc)

    # Create log
    log = models.EntryExitLog(
        id=str(uuid.uuid4()),
        student_id=student.id,
        warden_id=warden_id,
        action="EXIT",
        timestamp=now,
        gate=req.gate or "MAIN_GATE_1",
        device_info=req.device_info or "Warden Handheld Reader",
        remarks=req.remarks
    )
    db.add(log)

    # Update student state
    student.current_status = "OUTSIDE"
    student.last_exit_at = now
    db.commit()
    db.refresh(log)

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()
    room_number = alloc.room.room_number if alloc and alloc.room else "Unassigned"

    inside_count = db.query(models.Student).filter(models.Student.current_status == "INSIDE").count()
    outside_count = db.query(models.Student).filter(models.Student.current_status == "OUTSIDE").count()

    await ws_hub.broadcast({
        "type": "MOVEMENT_UPDATE",
        "payload": {
            "log_id": log.id,
            "student_id": student.id,
            "student_name": student.user.full_name,
            "student_code": student.student_code,
            "room_number": room_number,
            "action": "EXIT",
            "timestamp": now.isoformat(),
            "inside_count": inside_count,
            "outside_count": outside_count,
            "current_status": "OUTSIDE"
        }
    })

    result = MovementResultOut(
        log_id=log.id,
        student_id=student.id,
        student_name=student.user.full_name,
        action="EXIT",
        timestamp=now,
        current_status="OUTSIDE",
        message="Exit recorded successfully."
    )
    return StandardResponse(success=True, data=result, message="Exit recorded successfully")

@router.get("/student/{student_id}", response_model=StandardResponse[list[MovementLogOut]])
def get_student_movement_logs(
    student_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    # Guard: students can only access their own logs
    if payload.get("role") == "STUDENT" and payload.get("student_id") != student_id:
        raise forbidden_error("Access restricted to own activity logs")

    logs = db.query(models.EntryExitLog).filter(
        models.EntryExitLog.student_id == student_id
    ).order_by(models.EntryExitLog.timestamp.desc()).limit(50).all()

    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    s_name = student.user.full_name if student else None
    s_code = student.student_code if student else None

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student_id,
        models.RoomAllocation.is_active == True
    ).first()
    r_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"
    b_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Main Hostel"

    results = []
    for log in logs:
        results.append(MovementLogOut(
            id=log.id,
            student_id=log.student_id,
            student_name=s_name,
            student_code=s_code,
            room_number=r_no,
            block_name=b_name,
            action=log.action,
            timestamp=log.timestamp,
            gate=log.gate,
            device_info=log.device_info,
            remarks=log.remarks,
            warden_name=log.warden.user.full_name if log.warden else "Automated Gate"
        ))

    return StandardResponse(success=True, data=results)

@router.get("/live", response_model=StandardResponse[list[MovementLogOut]])
def get_live_movements(payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    logs = db.query(models.EntryExitLog).order_by(models.EntryExitLog.timestamp.desc()).limit(25).all()
    results = []
    for log in logs:
        alloc = db.query(models.RoomAllocation).filter(
            models.RoomAllocation.student_id == log.student_id,
            models.RoomAllocation.is_active == True
        ).first()
        r_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"
        b_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Main"

        results.append(MovementLogOut(
            id=log.id,
            student_id=log.student_id,
            student_name=log.student.user.full_name if log.student else "Student",
            student_code=log.student.student_code if log.student else "STU",
            room_number=r_no,
            block_name=b_name,
            action=log.action,
            timestamp=log.timestamp,
            gate=log.gate,
            device_info=log.device_info,
            remarks=log.remarks,
            warden_name=log.warden.user.full_name if log.warden else "Automated Gate"
        ))

    return StandardResponse(success=True, data=results)
