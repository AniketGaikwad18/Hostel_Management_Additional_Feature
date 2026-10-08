import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(128), unique=True, nullable=True)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False, default="STUDENT", index=True)  # STUDENT, WARDEN, ADMIN
    full_name = Column(String(128), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(256), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    warden_profile = relationship("Warden", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Warden(Base):
    __tablename__ = "wardens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = Column(String(64), unique=True, nullable=False)
    designation = Column(String(64), default="Hostel Warden")
    office_contact = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="warden_profile")
    entry_exit_logs = relationship("EntryExitLog", back_populates="warden")
    issued_fines = relationship("Fine", back_populates="issued_by_warden")
    announcements = relationship("Announcement", back_populates="warden")

class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    student_code = Column(String(32), unique=True, nullable=False, index=True)  # STU001
    course = Column(String(64), default="B.Tech Computer Science")
    year_of_study = Column(Integer, default=3)
    guardian_name = Column(String(128), nullable=True)
    guardian_phone = Column(String(32), nullable=True)
    current_status = Column(String(20), default="OUTSIDE", index=True)  # INSIDE, OUTSIDE
    last_entry_at = Column(DateTime, nullable=True)
    last_exit_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="student_profile")
    qr_identity = relationship("QrIdentity", back_populates="student", uselist=False, cascade="all, delete-orphan")
    room_allocations = relationship("RoomAllocation", back_populates="student", cascade="all, delete-orphan")
    entry_exit_logs = relationship("EntryExitLog", back_populates="student", cascade="all, delete-orphan", order_by="desc(EntryExitLog.timestamp)")
    complaints = relationship("Complaint", back_populates="student", cascade="all, delete-orphan")
    fees = relationship("Fee", back_populates="student", cascade="all, delete-orphan")
    fines = relationship("Fine", back_populates="student", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="student", cascade="all, delete-orphan")
    emergency_alerts = relationship("EmergencyAlert", back_populates="student", cascade="all, delete-orphan")

class Hostel(Base):
    __tablename__ = "hostels"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    code = Column(String(32), unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    blocks = relationship("Block", back_populates="hostel", cascade="all, delete-orphan")

class Block(Base):
    __tablename__ = "blocks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=False)
    name = Column(String(64), nullable=False)  # Block A, Block B
    total_floors = Column(Integer, default=4)

    hostel = relationship("Hostel", back_populates="blocks")
    floors = relationship("Floor", back_populates="block", cascade="all, delete-orphan")
    rooms = relationship("Room", back_populates="block", cascade="all, delete-orphan")

class Floor(Base):
    __tablename__ = "floors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    block_id = Column(String(36), ForeignKey("blocks.id"), nullable=False)
    floor_number = Column(Integer, nullable=False)

    block = relationship("Block", back_populates="floors")
    rooms = relationship("Room", back_populates="floor", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    block_id = Column(String(36), ForeignKey("blocks.id"), nullable=False)
    floor_id = Column(String(36), ForeignKey("floors.id"), nullable=False)
    room_number = Column(String(32), nullable=False, index=True)  # B-204
    capacity = Column(Integer, default=4)
    occupied_count = Column(Integer, default=0)
    status = Column(String(20), default="AVAILABLE")  # AVAILABLE, FULL, MAINTENANCE

    block = relationship("Block", back_populates="rooms")
    floor = relationship("Floor", back_populates="rooms")
    beds = relationship("Bed", back_populates="room", cascade="all, delete-orphan")
    allocations = relationship("RoomAllocation", back_populates="room")
    complaints = relationship("Complaint", back_populates="room")

class Bed(Base):
    __tablename__ = "beds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=False)
    bed_number = Column(String(16), nullable=False)  # B1, B2, B3, B4
    is_occupied = Column(Boolean, default=False)

    room = relationship("Room", back_populates="beds")
    allocation = relationship("RoomAllocation", back_populates="bed", uselist=False)

class RoomAllocation(Base):
    __tablename__ = "room_allocations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=False)
    bed_id = Column(String(36), ForeignKey("beds.id"), nullable=False)
    allocated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    vacated_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, index=True)

    student = relationship("Student", back_populates="room_allocations")
    room = relationship("Room", back_populates="allocations")
    bed = relationship("Bed", back_populates="allocation")

class QrIdentity(Base):
    __tablename__ = "qr_identities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), unique=True, nullable=False, index=True)
    secure_token = Column(String(128), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    student = relationship("Student", back_populates="qr_identity")

class EntryExitLog(Base):
    __tablename__ = "entry_exit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    warden_id = Column(String(36), ForeignKey("wardens.id"), nullable=True)
    action = Column(String(20), nullable=False, index=True)  # ENTRY, EXIT
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    gate = Column(String(64), default="MAIN_GATE_1")
    device_info = Column(String(256), default="Warden Terminal / Scanner")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="entry_exit_logs")
    warden = relationship("Warden", back_populates="entry_exit_logs")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_code = Column(String(32), unique=True, nullable=False, index=True)  # CMP-1001
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), nullable=False)  # Electrical, Plumbing, Wi-Fi, Cleaning, Furniture, Food, Water, Security, Maintenance, Other
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, URGENT
    status = Column(String(32), default="SUBMITTED", index=True)  # SUBMITTED, ACKNOWLEDGED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
    assigned_staff = Column(String(128), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    photo_url = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="complaints")
    room = relationship("Room", back_populates="complaints")
    updates = relationship("ComplaintUpdate", back_populates="complaint", cascade="all, delete-orphan", order_by="desc(ComplaintUpdate.created_at)")

class ComplaintUpdate(Base):
    __tablename__ = "complaint_updates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id"), nullable=False)
    status = Column(String(32), nullable=False)
    comment = Column(Text, nullable=True)
    updated_by = Column(String(128), default="Warden")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    complaint = relationship("Complaint", back_populates="updates")

class Fee(Base):
    __tablename__ = "fees"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    academic_year = Column(String(32), default="2026-2027")
    semester = Column(String(16), default="Semester 5")
    total_amount = Column(Float, nullable=False, default=45000.0)
    paid_amount = Column(Float, nullable=False, default=0.0)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="PENDING")  # PAID, PARTIAL, PENDING, OVERDUE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="fees")
    payments = relationship("FeePayment", back_populates="fee", cascade="all, delete-orphan")

class FeePayment(Base):
    __tablename__ = "fee_payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    fee_id = Column(String(36), ForeignKey("fees.id"), nullable=False)
    transaction_ref = Column(String(64), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(32), default="UPI")  # UPI, NetBanking, Card, Cash
    paid_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    fee = relationship("Fee", back_populates="payments")

class Fine(Base):
    __tablename__ = "fines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    category = Column(String(64), nullable=False)  # Late Entry, Rule Violation, Property Damage, Other
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING, PAID, WAIVED
    issued_by_warden_id = Column(String(36), ForeignKey("wardens.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="fines")
    issued_by_warden = relationship("Warden", back_populates="issued_fines")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(32), default="INFO")  # INFO, WARNING, URGENT, SUCCESS
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    warden_id = Column(String(36), ForeignKey("wardens.id"), nullable=True)
    title = Column(String(256), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(20), default="NORMAL")  # NORMAL, IMPORTANT, CRITICAL
    target_audience = Column(String(32), default="ALL")  # ALL, BLOCK_A, BLOCK_B
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    warden = relationship("Warden", back_populates="announcements")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    destination = Column(String(256), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING, APPROVED, REJECTED
    approved_by_warden_id = Column(String(36), ForeignKey("wardens.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="leave_requests")

class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, index=True)
    location = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="emergency_alerts")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    action = Column(String(64), nullable=False)
    entity = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
