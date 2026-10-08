from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.database import models
from app.schemas.warden import WardenDashboardOut
from app.schemas.student import StudentOut, StudentDetailOut
from app.schemas.movement import MovementLogOut
from app.schemas.common import StandardResponse
from app.core.security import require_warden
from app.core.errors import student_not_found_error

router = APIRouter(prefix="/warden", tags=["Warden Portal"])

@router.get("/dashboard", response_model=StandardResponse[WardenDashboardOut])
def get_warden_dashboard(payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    total_students = db.query(models.Student).count()
    inside_count = db.query(models.Student).filter(models.Student.current_status == "INSIDE").count()
    outside_count = db.query(models.Student).filter(models.Student.current_status == "OUTSIDE").count()

    total_rooms = db.query(models.Room).count()
    available_rooms = db.query(models.Room).filter(models.Room.occupied_count < models.Room.capacity).count()

    pending_complaints = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["SUBMITTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS"])
    ).count()

    urgent_complaints = db.query(models.Complaint).filter(
        models.Complaint.priority == "URGENT",
        models.Complaint.status.notin_(["RESOLVED", "CLOSED"])
    ).count()

    # Calculate total outstanding fee
    fees = db.query(models.Fee).all()
    outstanding_fees = sum((f.total_amount - f.paid_amount) for f in fees if f.total_amount > f.paid_amount)

    # Recent movements
    recent_logs = db.query(models.EntryExitLog).order_by(models.EntryExitLog.timestamp.desc()).limit(10).all()
    recent_movements = []
    for log in recent_logs:
        alloc = db.query(models.RoomAllocation).filter(
            models.RoomAllocation.student_id == log.student_id,
            models.RoomAllocation.is_active == True
        ).first()
        r_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"
        b_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "Block B"

        recent_movements.append(MovementLogOut(
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

    dashboard_data = WardenDashboardOut(
        total_students=total_students,
        inside_count=inside_count,
        outside_count=outside_count,
        available_rooms=available_rooms,
        total_rooms=total_rooms,
        pending_complaints=pending_complaints,
        urgent_complaints=urgent_complaints,
        outstanding_fees=float(outstanding_fees),
        recent_movements=recent_movements
    )
    return StandardResponse(success=True, data=dashboard_data)

@router.get("/students", response_model=StandardResponse[List[StudentOut]])
def get_students_list(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    block: Optional[str] = Query(None),
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
    query = db.query(models.Student)

    if status:
        query = query.filter(models.Student.current_status == status.upper())

    students = query.all()
    results = []

    for s in students:
        alloc = db.query(models.RoomAllocation).filter(
            models.RoomAllocation.student_id == s.id,
            models.RoomAllocation.is_active == True
        ).first()

        room_no = alloc.room.room_number if alloc and alloc.room else "Unassigned"
        block_name = alloc.room.block.name if alloc and alloc.room and alloc.room.block else "None"
        bed_no = alloc.bed.bed_number if alloc and alloc.bed else "None"

        # Search filter by name, student_code, or room
        if search:
            s_low = search.lower()
            if (s_low not in s.user.full_name.lower() and
                s_low not in s.student_code.lower() and
                s_low not in room_no.lower()):
                continue

        if block and block.lower() not in block_name.lower():
            continue

        results.append(StudentOut(
            id=s.id,
            user_id=s.user_id,
            student_code=s.student_code,
            full_name=s.user.full_name,
            email=s.user.email,
            phone=s.user.phone,
            course=s.course,
            year_of_study=s.year_of_study,
            guardian_name=s.guardian_name,
            guardian_phone=s.guardian_phone,
            current_status=s.current_status,
            last_entry_at=s.last_entry_at,
            last_exit_at=s.last_exit_at,
            hostel_name="Aryabhatta Residential Complex",
            block_name=block_name,
            room_number=room_no,
            bed_number=bed_no
        ))

    return StandardResponse(success=True, data=results)

@router.get("/students/{student_id}", response_model=StandardResponse[StudentDetailOut])
def get_student_detail(
    student_id: str,
    payload: dict = Depends(require_warden),
    db: Session = Depends(get_db)
):
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
