from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database import models
from app.schemas.finance import FeeOut, FeePaymentOut
from app.schemas.common import StandardResponse
from app.core.security import require_warden, get_current_user_payload
from app.core.config import settings

router = APIRouter(prefix="/fees", tags=["Hostel Fees"])

@router.get("", response_model=StandardResponse[List[FeeOut]])
def get_all_fees(payload: dict = Depends(require_warden), db: Session = Depends(get_db)):
    fees = db.query(models.Fee).all()
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
            student_name=f.student.user.full_name if f.student else "Student",
            student_code=f.student.student_code if f.student else "STU",
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

@router.get("/student/{student_id}", response_model=StandardResponse[List[FeeOut]])
def get_fees_by_student(student_id: str, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
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
            student_name=f.student.user.full_name if f.student else "Student",
            student_code=f.student.student_code if f.student else "STU",
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
