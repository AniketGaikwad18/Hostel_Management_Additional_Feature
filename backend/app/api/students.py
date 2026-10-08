from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.student import StudentDetailOut
from app.schemas.room import RoomOut, BedOut
from app.schemas.finance import FeeOut, FineOut, FeePaymentOut
from app.schemas.complaint import ComplaintOut
from app.schemas.movement import MovementLogOut
from app.schemas.common import StandardResponse
from app.core.security import require_student
from app.core.errors import student_not_found_error
from app.core.config import settings

router = APIRouter(prefix="/students", tags=["Student Self-Service"])

@router.get("/me", response_model=StandardResponse[StudentDetailOut])
def get_student_profile(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise student_not_found_error()

    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student.id,
        models.RoomAllocation.is_active == True
    ).first()

    room_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"
    block_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Block B"
    bed_no = alloc.bed.bed_number if alloc and alloc.bed else "None"

    pending_cmp = db.query(models.Complaint).filter(
        models.Complaint.student_id == student.id,
        models.Complaint.status.notin_(["RESOLVED", "CLOSED"])
    ).count()

    fines = db.query(models.Fine).filter(
        models.Fine.student_id == student.id,
        models.Fine.status == "PENDING"
    ).all()
    total_fines = sum(f.amount for f in fines)

    fees = db.query(models.Fee).filter(models.Fee.student_id == student.id).all()
    outstanding_fee = sum((f.total_amount - f.paid_amount) for f in fees if f.total_amount > f.paid_amount)

    logs = db.query(models.EntryExitLog).filter(
        models.EntryExitLog.student_id == student.id
    ).order_by(models.EntryExitLog.timestamp.desc()).limit(10).all()

    recent_logs_data = [{
        "id": l.id,
        "action": l.action,
        "timestamp": l.timestamp.isoformat(),
        "gate": l.gate,
        "remarks": l.remarks
    } for l in logs]

    detail = StudentDetailOut(
        id=student.id,
        user_id=student.user_id,
        student_code=student.student_code,
        full_name=student.user.full_name,
        email=student.user.email,
        phone=student.user.phone,
        course=student.course,
        year_of_study=student.year_of_study,
        guardian_name=student.guardian_name,
        guardian_phone=student.guardian_phone,
        current_status=student.current_status,
        last_entry_at=student.last_entry_at,
        last_exit_at=student.last_exit_at,
        hostel_name="Aryabhatta Residential Complex",
        block_name=block_name,
        room_number=room_no,
        bed_number=bed_no,
        pending_complaints_count=pending_cmp,
        total_fines_amount=float(total_fines),
        outstanding_fee_amount=float(outstanding_fee),
        recent_logs=recent_logs_data
    )
    return StandardResponse(success=True, data=detail)

@router.get("/me/room", response_model=StandardResponse[dict])
def get_student_room(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student_id,
        models.RoomAllocation.is_active == True
    ).first()

    if not alloc or not alloc.room:
        return StandardResponse(
            success=True,
            data={"allocated": False, "message": "No room currently allocated."}
        )

    room = alloc.room
    # Find roommates
    roommates_allocs = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.room_id == room.id,
        models.RoomAllocation.is_active == True
    ).all()

    roommates = []
    for ra in roommates_allocs:
        roommates.append({
            "student_id": ra.student.id,
            "student_code": ra.student.student_code,
            "name": ra.student.user.full_name,
            "bed": ra.bed.bed_number if ra.bed else "N/A",
            "status": ra.student.current_status,
            "is_me": ra.student_id == student_id
        })

    data = {
        "allocated": True,
        "room_id": room.id,
        "room_number": room.room_number,
        "block": room.block.name,
        "floor": room.floor.floor_number,
        "my_bed": alloc.bed.bed_number if alloc.bed else "B1",
        "capacity": room.capacity,
        "occupied_count": room.occupied_count,
        "roommates": roommates
    }
    return StandardResponse(success=True, data=data)

@router.get("/me/fees", response_model=StandardResponse[list[FeeOut]])
def get_student_fees(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    fees = db.query(models.Fee).filter(models.Fee.student_id == student_id).all()
    results = []
    for f in fees:
        payments_data = [
            FeePaymentOut(
                id=p.id,
                transaction_ref=p.transaction_ref,
                amount=p.amount,
                payment_method=p.payment_method,
                paid_at=p.paid_at
            ) for p in f.payments
        ]
        results.append(FeeOut(
            id=f.id,
            student_id=f.student_id,
            student_name=f.student.user.full_name,
            student_code=f.student.student_code,
            academic_year=f.academic_year,
            semester=f.semester,
            total_amount=f.total_amount,
            paid_amount=f.paid_amount,
            remaining_balance=max(0.0, f.total_amount - f.paid_amount),
            due_date=f.due_date,
            status=f.status,
            payment_url=settings.UNIVERSITY_PAYMENT_URL,
            payments=payments_data
        ))
    return StandardResponse(success=True, data=results)

@router.get("/me/fines", response_model=StandardResponse[list[FineOut]])
def get_student_fines(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    fines = db.query(models.Fine).filter(models.Fine.student_id == student_id).all()
    results = [
        FineOut(
            id=fn.id,
            student_id=fn.student_id,
            student_name=fn.student.user.full_name,
            student_code=fn.student.student_code,
            category=fn.category,
            amount=fn.amount,
            reason=fn.reason,
            status=fn.status,
            issued_by_warden=fn.issued_by_warden.user.full_name if fn.issued_by_warden else "Chief Warden",
            created_at=fn.created_at
        ) for fn in fines
    ]
    return StandardResponse(success=True, data=results)

@router.get("/me/complaints", response_model=StandardResponse[list[ComplaintOut]])
def get_student_complaints(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    complaints = db.query(models.Complaint).filter(
        models.Complaint.student_id == student_id
    ).order_by(models.Complaint.created_at.desc()).all()

    results = []
    for c in complaints:
        results.append(ComplaintOut(
            id=c.id,
            complaint_code=c.complaint_code,
            student_id=c.student_id,
            student_name=c.student.user.full_name,
            student_code=c.student.student_code,
            room_number=c.room.room_number if c.room else "N/A",
            title=c.title,
            description=c.description,
            category=c.category,
            priority=c.priority,
            status=c.status,
            assigned_staff=c.assigned_staff,
            resolution_notes=c.resolution_notes,
            created_at=c.created_at,
            updated_at=c.updated_at,
            updates=[]
        ))
    return StandardResponse(success=True, data=results)

@router.get("/me/activity", response_model=StandardResponse[list[MovementLogOut]])
def get_student_activity(payload: dict = Depends(require_student), db: Session = Depends(get_db)):
    student_id = payload.get("student_id")
    logs = db.query(models.EntryExitLog).filter(
        models.EntryExitLog.student_id == student_id
    ).order_by(models.EntryExitLog.timestamp.desc()).limit(30).all()

    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    alloc = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.student_id == student_id,
        models.RoomAllocation.is_active == True
    ).first()
    room_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"
    block_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Block B"

    results = [
        MovementLogOut(
            id=l.id,
            student_id=l.student_id,
            student_name=student.user.full_name if student else "Me",
            student_code=student.student_code if student else "STU001",
            room_number=room_no,
            block_name=block_name,
            action=l.action,
            timestamp=l.timestamp,
            gate=l.gate,
            device_info=l.device_info,
            remarks=l.remarks,
            warden_name=l.warden.user.full_name if l.warden else "Automated Gate"
        ) for l in logs
    ]
    return StandardResponse(success=True, data=results)
