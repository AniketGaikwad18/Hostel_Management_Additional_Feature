import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database import models
from app.schemas.finance import FineCreate, FineOut, FineStatusUpdate
from app.schemas.common import StandardResponse
from app.core.security import require_warden, get_current_user_payload
from app.core.errors import not_found_error, student_not_found_error

router = APIRouter(prefix="/fines", tags=["Disciplinary Fines"])

@router.get("", response_model=StandardResponse[List[FineOut]])
def list_fines(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    query = db.query(models.Fine)
    if payload.get("role") == "STUDENT":
        query = query.filter(models.Fine.student_id == payload.get("student_id"))

    fines = query.order_by(models.Fine.created_at.desc()).all()
    results = [
        FineOut(
            id=fn.id,
            student_id=fn.student_id,
            student_name=fn.student.user.full_name if fn.student else "Student",
            student_code=fn.student.student_code if fn.student else "STU",
            category=fn.category,
            amount=fn.amount,
            reason=fn.reason,
            status=fn.status,
            issued_by_warden=fn.issued_by_warden.user.full_name if fn.issued_by_warden else "Hostel Office",
            created_at=fn.created_at
        ) for fn in fines
    ]
    return StandardResponse(success=True, data=results)

@router.post("", response_model=StandardResponse[FineOut])
def issue_fine(req: FineCreate, payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    if not student:
        raise student_not_found_error()

    warden_id = payload.get("warden_id")
    fine = models.Fine(
        id=str(uuid.uuid4()),
        student_id=student.id,
        category=req.category,
        amount=req.amount,
        reason=req.reason,
        status="PENDING",
        issued_by_warden_id=warden_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(fine)
    db.commit()
    db.refresh(fine)

    out = FineOut(
        id=fine.id,
        student_id=fine.student_id,
        student_name=student.user.full_name,
        student_code=student.student_code,
        category=fine.category,
        amount=fine.amount,
        reason=fine.reason,
        status=fine.status,
        issued_by_warden=payload.get("full_name", "Warden"),
        created_at=fine.created_at
    )
    return StandardResponse(success=True, data=out, message="Fine issued successfully")

@router.patch("/{fine_id}/status", response_model=StandardResponse[dict])
def update_fine_status(fine_id: str, req: FineStatusUpdate, payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    fine = db.query(models.Fine).filter(models.Fine.id == fine_id).first()
    if not fine:
        raise not_found_error("Fine")

    fine.status = req.status.upper()
    db.commit()
    return StandardResponse(success=True, message=f"Fine status updated to {fine.status}")
