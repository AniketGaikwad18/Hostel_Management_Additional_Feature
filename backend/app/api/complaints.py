import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.database import models
from app.schemas.complaint import ComplaintCreate, ComplaintUpdateStatus, ComplaintOut, ComplaintUpdateLogOut
from app.schemas.common import StandardResponse
from app.core.security import get_current_user_payload, require_warden
from app.core.errors import complaint_not_found_error, forbidden_error
from app.core.websocket_hub import ws_hub

router = APIRouter(prefix="/complaints", tags=["Complaints Operations"])

@router.post("", response_model=StandardResponse[ComplaintOut])
async def create_complaint(
    req: ComplaintCreate,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    student_id = payload.get("student_id")
    if not student_id:
        raise forbidden_error("Only students can file complaints")

    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student_id,
        models.RoomAllocation.is_active == True
    ).first()
    room_id = alloc.room_id if alloc else None

    # Generate sequential complaint code
    count = db.query(models.Complaint).count() + 1001
    complaint_code = f"CMP-{count}"

    complaint = models.Complaint(
        id=str(uuid.uuid4()),
        complaint_code=complaint_code,
        student_id=student_id,
        room_id=room_id,
        title=req.title,
        description=req.description,
        category=req.category,
        priority=req.priority,
        status="SUBMITTED",
        photo_url=req.photo_url
    )
    db.add(complaint)

    # Initial log
    update_log = models.ComplaintUpdate(
        id=str(uuid.uuid4()),
        complaint_id=complaint.id,
        status="SUBMITTED",
        comment="Complaint registered by student",
        updated_by=student.user.full_name
    )
    db.add(update_log)
    db.commit()
    db.refresh(complaint)

    room_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"

    # Broadcast complaint event
    await ws_hub.broadcast({
        "type": "COMPLAINT_CREATED",
        "payload": {
            "id": complaint.id,
            "code": complaint.complaint_code,
            "title": complaint.title,
            "category": complaint.category,
            "priority": complaint.priority,
            "student_name": student.user.full_name,
            "room_number": room_no,
            "status": "SUBMITTED"
        }
    })

    out = ComplaintOut(
        id=complaint.id,
        complaint_code=complaint.complaint_code,
        student_id=complaint.student_id,
        student_name=student.user.full_name,
        student_code=student.student_code,
        room_number=room_no,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        priority=complaint.priority,
        status=complaint.status,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        updates=[]
    )
    return StandardResponse(success=True, data=out, message="Complaint submitted successfully")

@router.get("", response_model=StandardResponse[List[ComplaintOut]])
def list_complaints(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    query = db.query(models.Complaint)
    role = payload.get("role")

    if role == "STUDENT":
        query = query.filter(models.Complaint.student_id == payload.get("student_id"))

    if status:
        query = query.filter(models.Complaint.status == status.upper())
    if category:
        query = query.filter(models.Complaint.category == category)
    if priority:
        query = query.filter(models.Complaint.priority == priority.upper())

    complaints = query.order_by(models.Complaint.created_at.desc()).all()
    results = []

    for c in complaints:
        student_name = c.student.user.full_name if c.student else "Unknown"
        student_code = c.student.student_code if c.student else "STU"
        room_no = c.room.room_number if c.room else "Unassigned"

        updates_data = [
            ComplaintUpdateLogOut(
                id=u.id,
                status=u.status,
                comment=u.comment,
                updated_by=u.updated_by,
                created_at=u.created_at
            ) for u in c.updates
        ]

        results.append(ComplaintOut(
            id=c.id,
            complaint_code=c.complaint_code,
            student_id=c.student_id,
            student_name=student_name,
            student_code=student_code,
            room_number=room_no,
            title=c.title,
            description=c.description,
            category=c.category,
            priority=c.priority,
            status=c.status,
            assigned_staff=c.assigned_staff,
            resolution_notes=c.resolution_notes,
            created_at=c.created_at,
            updated_at=c.updated_at,
            updates=updates_data
        ))

    return StandardResponse(success=True, data=results)

@router.get("/{complaint_id}", response_model=StandardResponse[ComplaintOut])
def get_complaint(
    complaint_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise complaint_not_found_error()

    if payload.get("role") == "STUDENT" and complaint.student_id != payload.get("student_id"):
        raise forbidden_error("Access restricted to own complaints")

    student_name = complaint.student.user.full_name if complaint.student else "Unknown"
    student_code = complaint.student.student_code if complaint.student else "STU"
    room_no = complaint.room.room_number if complaint.room else "Unassigned"

    updates_data = [
        ComplaintUpdateLogOut(
            id=u.id,
            status=u.status,
            comment=u.comment,
            updated_by=u.updated_by,
            created_at=u.created_at
        ) for u in complaint.updates
    ]

    out = ComplaintOut(
        id=complaint.id,
        complaint_code=complaint.complaint_code,
        student_id=complaint.student_id,
        student_name=student_name,
        student_code=student_code,
        room_number=room_no,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        priority=complaint.priority,
        status=complaint.status,
        assigned_staff=complaint.assigned_staff,
        resolution_notes=complaint.resolution_notes,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        updates=updates_data
    )
    return StandardResponse(success=True, data=out)

@router.patch("/{complaint_id}/status", response_model=StandardResponse[ComplaintOut])
async def update_complaint_status(
    complaint_id: str,
    req: ComplaintUpdateStatus,
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise complaint_not_found_error()

    complaint.status = req.status.upper()
    if req.assigned_staff:
        complaint.assigned_staff = req.assigned_staff
    if req.resolution_notes:
        complaint.resolution_notes = req.resolution_notes
    complaint.updated_at = datetime.now(timezone.utc)

    # Add history log
    warden_name = payload.get("full_name", "Warden")
    update_log = models.ComplaintUpdate(
        id=str(uuid.uuid4()),
        complaint_id=complaint.id,
        status=complaint.status,
        comment=req.resolution_notes or f"Status changed to {complaint.status}",
        updated_by=warden_name
    )
    db.add(update_log)
    db.commit()
    db.refresh(complaint)

    await ws_hub.broadcast({
        "type": "COMPLAINT_UPDATED",
        "payload": {
            "id": complaint.id,
            "code": complaint.complaint_code,
            "status": complaint.status,
            "assigned_staff": complaint.assigned_staff,
            "resolution_notes": complaint.resolution_notes
        }
    })

    return StandardResponse(success=True, message=f"Complaint marked as {complaint.status}")
