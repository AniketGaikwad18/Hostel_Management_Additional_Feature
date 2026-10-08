import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database import models
from app.schemas.misc import LeaveRequestCreate, LeaveRequestOut
from app.schemas.common import StandardResponse
from app.core.security import get_current_user_payload, require_warden
from app.core.errors import forbidden_error, not_found_error

router = APIRouter(prefix="/leave", tags=["Leave & Outing Passes"])

@router.post("", response_model=StandardResponse[LeaveRequestOut])
def apply_leave(
    req: LeaveRequestCreate,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    student_id = payload.get("student_id")
    if not student_id:
        raise forbidden_error("Only students can apply for leave")

    student = db.query(models.Student).filter(models.Student.id == student_id).first()

    leave = models.LeaveRequest(
        id=str(uuid.uuid4()),
        student_id=student.id,
        start_date=req.start_date,
        end_date=req.end_date,
        destination=req.destination,
        reason=req.reason,
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()
    r_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"

    out = LeaveRequestOut(
        id=leave.id,
        student_id=leave.student_id,
        student_name=student.user.full_name,
        student_code=student.student_code,
        room_number=r_no,
        start_date=leave.start_date,
        end_date=leave.end_date,
        destination=leave.destination,
        reason=leave.reason,
        status=leave.status,
        created_at=leave.created_at
    )
    return StandardResponse(success=True, data=out, message="Leave request submitted")

@router.get("", response_model=StandardResponse[List[LeaveRequestOut]])
def list_leave_requests(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    query = db.query(models.LeaveRequest)
    if payload.get("role") == "STUDENT":
        query = query.filter(models.LeaveRequest.student_id == payload.get("student_id"))

    items = query.order_by(models.LeaveRequest.created_at.desc()).all()
    results = []
    for l in items:
        alloc = db.query(models.RoomAllocation).filter(
            models.RoomAllocation.student_id == l.student_id,
            models.RoomAllocation.is_active == True
        ).first()
        r_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"

        results.append(LeaveRequestOut(
            id=l.id,
            student_id=l.student_id,
            student_name=l.student.user.full_name if l.student else "Student",
            student_code=l.student.student_code if l.student else "STU",
            room_number=r_no,
            start_date=l.start_date,
            end_date=l.end_date,
            destination=l.destination,
            reason=l.reason,
            status=l.status,
            created_at=l.created_at
        ))
    return StandardResponse(success=True, data=results)

@router.patch("/{leave_id}", response_model=StandardResponse[dict])
def update_leave_status(
    leave_id: str,
    status_update: dict,
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave:
        raise not_found_error("Leave request")

    new_status = status_update.get("status", "APPROVED").upper()
    leave.status = new_status
    leave.approved_by_warden_id = payload.get("warden_id")
    db.commit()

    return StandardResponse(success=True, message=f"Leave request marked as {new_status}")
