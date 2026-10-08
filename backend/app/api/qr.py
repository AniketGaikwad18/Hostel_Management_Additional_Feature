import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.qr import QrStudentOut, QrValidateRequest, QrValidatePreviewOut
from app.schemas.student import StudentDetailOut
from app.schemas.common import StandardResponse
from app.core.security import require_student, require_warden
from app.core.config import settings
from app.core.errors import invalid_qr_error, qr_expired_error, student_not_found_error

router = APIRouter(prefix="/qr", tags=["QR Identity"])

@router.get("/student", response_model=StandardResponse[QrStudentOut])
def get_my_qr(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise student_not_found_error()

    qr = db.query(models.QrIdentity).filter(
        models.QrIdentity.student_id == student.id,
        models.QrIdentity.is_active == True
    ).first()

    now = datetime.now(timezone.utc)
    if not qr or (qr.expires_at and qr.expires_at.replace(tzinfo=timezone.utc) < now):
        # Generate new token
        secure_token = f"hs_sec_{student.student_code.lower()}_{uuid.uuid4().hex[:12]}"
        qr = models.QrIdentity(
            id=str(uuid.uuid4()),
            student_id=student.id,
            secure_token=secure_token,
            expires_at=now + timedelta(days=365),
            is_active=True
        )
        db.add(qr)
        db.commit()
        db.refresh(qr)

    # Fetch allocation & room
    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()
    
    room_number = alloc.room.room_number if alloc and alloc.room else "Unassigned"
    block_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Main Hostel"
    hostel_name = "Aryabhatta Residential Complex"

    scan_url = f"{settings.NEXT_PUBLIC_APP_URL}/scan?token={qr.secure_token}"

    data = QrStudentOut(
        qr_id=qr.id,
        student_id=student.id,
        student_name=student.user.full_name,
        student_code=student.student_code,
        hostel_name=hostel_name,
        block_name=block_name,
        room_number=room_number,
        current_status=student.current_status,
        secure_token=qr.secure_token,
        scan_url=scan_url,
        created_at=qr.created_at,
        expires_at=qr.expires_at,
        is_active=qr.is_active
    )
    return StandardResponse(success=True, data=data)

@router.post("/regenerate", response_model=StandardResponse[QrStudentOut])
def regenerate_qr(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise student_not_found_error()

    # Deactivate existing tokens
    db.query(models.QrIdentity).filter(models.QrIdentity.student_id == student.id).update({"is_active": False})
    
    new_token = f"hs_sec_{student.student_code.lower()}_{uuid.uuid4().hex[:12]}"
    qr = models.QrIdentity(
        id=str(uuid.uuid4()),
        student_id=student.id,
        secure_token=new_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=365),
        is_active=True
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()
    room_number = alloc.room.room_number if alloc and alloc.room else "Unassigned"
    block_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Main Hostel"

    scan_url = f"{settings.NEXT_PUBLIC_APP_URL}/scan?token={qr.secure_token}"
    data = QrStudentOut(
        qr_id=qr.id,
        student_id=student.id,
        student_name=student.user.full_name,
        student_code=student.student_code,
        hostel_name="Aryabhatta Residential Complex",
        block_name=block_name,
        room_number=room_number,
        current_status=student.current_status,
        secure_token=qr.secure_token,
        scan_url=scan_url,
        created_at=qr.created_at,
        expires_at=qr.expires_at,
        is_active=qr.is_active
    )
    return StandardResponse(success=True, data=data, message="New QR identity generated")

@router.post("/validate", response_model=StandardResponse[QrValidatePreviewOut])
def validate_qr_public_preview(req: QrValidateRequest, db: Session = Depends(get_db)):
    """Public preview when phone scans QR. Does NOT expose sensitive student PII."""
    qr = db.query(models.QrIdentity).filter(
        models.QrIdentity.secure_token == req.token,
        models.QrIdentity.is_active == True
    ).first()

    if not qr:
        raise invalid_qr_error("Unrecognized or inactive QR token")

    if qr.expires_at and qr.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise qr_expired_error()

    student = qr.student
    if not student:
        raise student_not_found_error()

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()
    room_number = alloc.room.room_number if alloc and alloc.room else "Unassigned"
    block_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Block B"

    data = QrValidatePreviewOut(
        valid=True,
        student_id=student.id,
        student_name=student.user.full_name,
        student_code=student.student_code,
        room_number=room_number,
        block_name=block_name,
        current_status=student.current_status
    )
    return StandardResponse(success=True, data=data)

@router.post("/scan", response_model=StandardResponse[dict])
def scan_qr_authenticated(req: QrValidateRequest, payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    """Warden-authenticated scan token resolver, returns full student verification dossier."""
    qr = db.query(models.QrIdentity).filter(
        models.QrIdentity.secure_token == req.token,
        models.QrIdentity.is_active == True
    ).first()

    if not qr:
        raise invalid_qr_error()

    student = qr.student
    if not student:
        raise student_not_found_error()

    return StandardResponse(
        success=True,
        data={
            "student_id": student.id,
            "student_code": student.student_code,
            "full_name": student.user.full_name,
            "verified": True
        },
        message="Student token verified by Warden"
    )
