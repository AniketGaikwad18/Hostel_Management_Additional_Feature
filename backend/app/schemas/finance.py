from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FeePaymentOut(BaseModel):
    id: str
    transaction_ref: str
    amount: float
    payment_method: str
    paid_at: datetime

class FeeOut(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    academic_year: str
    semester: str
    total_amount: float
    paid_amount: float
    remaining_balance: float
    due_date: datetime
    status: str
    payment_url: Optional[str] = None
    payments: List[FeePaymentOut] = []

class FineCreate(BaseModel):
    student_id: str
    category: str  # Late Entry, Rule Violation, Property Damage, Other
    amount: float
    reason: str

class FineOut(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    category: str
    amount: float
    reason: str
    status: str  # PENDING, PAID, WAIVED
    issued_by_warden: Optional[str] = None
    created_at: datetime

class FineStatusUpdate(BaseModel):
    status: str  # PENDING, PAID, WAIVED
