import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database import models
from app.schemas.misc import EmergencyAlertCreate, EmergencyAlertOut
from app.schemas.common import StandardResponse
from app.core.security import get_current_user_payload, require_warden
from app.core.errors import forbidden_error, student_not_found_error
from app.core.websocket_hub import ws_hub

router = APIRouter(prefix="/emergency", tags=["Emergency SOS"])

@router.post("", response_model=StandardResponse[EmergencyAlertOut])
async def trigger_emergency(
    req: EmergencyAlertCreate,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    student_id = payload.get("student_id")
    if not student_id:
        raise forbidden_error("Only students can trigger SOS")

    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise student_not_found_error()

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()
    room_no = alloc.room.room_number if alloc and alloc.room else "Hostel Campus"

    alert = models.EmergencyAlert(
        id=str(uuid.uuid4()),
        student_id=student.id,
        location=req.location,
        message=req.message,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc)
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Real-time High Priority Broadcast
    await ws_hub.broadcast({
        "type": "EMERGENCY_TRIGGERED",
        "payload": {
            "id": alert.id,
            "student_name": student.user.full_name,
            "student_code": student.student_code,
            "room_number": room_no,
            "location": alert.location,
            "message": alert.message,
            "timestamp": alert.created_at.isoformat()
        }
    })

    out = EmergencyAlertOut(
        id=alert.id,
        student_id=alert.student_id,
        student_name=student.user.full_name,
        student_code=student.student_code,
        room_number=room_no,
        location=alert.location,
        message=alert.message,
        status=alert.status,
        created_at=alert.created_at
    )
    return StandardResponse(success=True, data=out, message="Emergency SOS triggered! Warden alerted immediately.")

@router.get("", response_model=StandardResponse[List[EmergencyAlertOut]])
def list_emergencies(payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    alerts = db.query(models.EmergencyAlert).order_by(models.EmergencyAlert.created_at.desc()).all()
    results = []
    for a in alerts:
        alloc = db.query(models.RoomAllocation).filter(
            models.RoomAllocation.student_id == a.student_id,
            models.RoomAllocation.is_active == True
        ).first()
        r_no = alloc.room.room_number if alloc and alloc.room else "Hostel Campus"

        results.append(EmergencyAlertOut(
            id=a.id,
            student_id=a.student_id,
            student_name=a.student.user.full_name if a.student else "Student",
            student_code=a.student.student_code if a.student else "STU",
            room_number=r_no,
            location=a.location,
            message=a.message,
            status=a.status,
            created_at=a.created_at
        ))
    return StandardResponse(success=True, data=results)
