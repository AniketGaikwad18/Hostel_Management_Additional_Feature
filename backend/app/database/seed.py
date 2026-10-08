import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine, Base
from app.database import models
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    existing_warden = db.query(models.User).filter(models.User.username == "WARDEN001").first()
    if existing_warden:
        print("[SEED] Database already seeded. Skipping.")
        db.close()
        return

    print("[SEED] Seeding Hostelsphere Database...")

    # 1. Create Hostel
    hostel = models.Hostel(
        id=str(uuid.uuid4()),
        name="Aryabhatta Residential Complex",
        code="ARC-MAIN"
    )
    db.add(hostel)
    db.flush()

    # 2. Create Blocks
    block_a = models.Block(id=str(uuid.uuid4()), hostel_id=hostel.id, name="Block A", total_floors=4)
    block_b = models.Block(id=str(uuid.uuid4()), hostel_id=hostel.id, name="Block B", total_floors=4)
    db.add_all([block_a, block_b])
    db.flush()

    # 3. Create Floors & 50 Rooms
    rooms_list = []
    beds_list = []
    
    # 25 rooms in Block A, 25 rooms in Block B
    for block, prefix in [(block_a, "A"), (block_b, "B")]:
        for floor_num in range(1, 5):
            floor = models.Floor(id=str(uuid.uuid4()), block_id=block.id, floor_number=floor_num)
            db.add(floor)
            db.flush()

            rooms_on_floor = 6 if floor_num < 4 else 7
            for r in range(1, rooms_on_floor + 1):
                room_no = f"{prefix}-{floor_num}0{r}"
                room = models.Room(
                    id=str(uuid.uuid4()),
                    block_id=block.id,
                    floor_id=floor.id,
                    room_number=room_no,
                    capacity=4,
                    occupied_count=0,
                    status="AVAILABLE"
                )
                rooms_list.append(room)
                db.add(room)
                db.flush()

                for b in range(1, 5):
                    bed = models.Bed(
                        id=str(uuid.uuid4()),
                        room_id=room.id,
                        bed_number=f"B{b}",
                        is_occupied=False
                    )
                    beds_list.append(bed)
                    db.add(bed)

    db.flush()

    # Find room B-204
    room_b204 = next((r for r in rooms_list if r.room_number == "B-204"), rooms_list[0])
    bed_b204_1 = next((b for b in beds_list if b.room_id == room_b204.id and b.bed_number == "B1"), None)

    # 4. Create Warden
    warden_user = models.User(
        id=str(uuid.uuid4()),
        username="WARDEN001",
        email="warden@hostelsphere.edu",
        password_hash=get_password_hash("warden123"),
        role="WARDEN",
        full_name="Dr. Rajesh Sharma",
        phone="+91 98765 43210"
    )
    db.add(warden_user)
    db.flush()

    warden = models.Warden(
        id=str(uuid.uuid4()),
        user_id=warden_user.id,
        employee_id="EMP-W01",
        designation="Chief Hostel Warden",
        office_contact="+91 98765 43210"
    )
    db.add(warden)
    db.flush()

    # 5. Create Demo Student: Aniket Gaikwad (STU001)
    stu_demo_user = models.User(
        id=str(uuid.uuid4()),
        username="STU001",
        email="aniket.gaikwad@hostelsphere.edu",
        password_hash=get_password_hash("student123"),
        role="STUDENT",
        full_name="Aniket Gaikwad",
        phone="+91 91234 56789"
    )
    db.add(stu_demo_user)
    db.flush()

    stu_demo = models.Student(
        id=str(uuid.uuid4()),
        user_id=stu_demo_user.id,
        student_code="STU001",
        course="B.Tech Computer Science (AI & ML)",
        year_of_study=3,
        guardian_name="Sanjay Gaikwad",
        guardian_phone="+91 98220 12345",
        current_status="OUTSIDE",
        last_exit_at=datetime.now(timezone.utc) - timedelta(hours=2)
    )
    db.add(stu_demo)
    db.flush()

    # Demo Student QR Identity (secure unguessable token)
    qr_demo = models.QrIdentity(
        id=str(uuid.uuid4()),
        student_id=stu_demo.id,
        secure_token="hs_sec_aniket_stu001_demo",
        expires_at=datetime.now(timezone.utc) + timedelta(days=365),
        is_active=True
    )
    db.add(qr_demo)

    # Demo Student Room Allocation
    if bed_b204_1:
        bed_b204_1.is_occupied = True
        room_b204.occupied_count += 1
        alloc_demo = models.RoomAllocation(
            id=str(uuid.uuid4()),
            student_id=stu_demo.id,
            room_id=room_b204.id,
            bed_id=bed_b204_1.id,
            allocated_at=datetime.now(timezone.utc) - timedelta(days=90),
            is_active=True
        )
        db.add(alloc_demo)

    # Demo Student Movement Logs
    log_exit = models.EntryExitLog(
        id=str(uuid.uuid4()),
        student_id=stu_demo.id,
        warden_id=warden.id,
        action="EXIT",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=2),
        gate="MAIN_GATE_1",
        device_info="Gate Tablet Reader #01",
        remarks="Outstation library session"
    )
    log_entry_prev = models.EntryExitLog(
        id=str(uuid.uuid4()),
        student_id=stu_demo.id,
        warden_id=warden.id,
        action="ENTRY",
        timestamp=datetime.now(timezone.utc) - timedelta(hours=8),
        gate="MAIN_GATE_1",
        device_info="Gate Tablet Reader #01",
        remarks="Routine return"
    )
    db.add_all([log_exit, log_entry_prev])

    # Demo Student Fees
    fee_demo = models.Fee(
        id=str(uuid.uuid4()),
        student_id=stu_demo.id,
        academic_year="2026-2027",
        semester="Semester 5",
        total_amount=45000.0,
        paid_amount=35000.0,
        due_date=datetime.now(timezone.utc) + timedelta(days=15),
        status="PARTIAL"
    )
    db.add(fee_demo)
    db.flush()

    payment_demo = models.FeePayment(
        id=str(uuid.uuid4()),
        fee_id=fee_demo.id,
        transaction_ref="UPI-TXN-984210",
        amount=35000.0,
        payment_method="UPI",
        paid_at=datetime.now(timezone.utc) - timedelta(days=30)
    )
    db.add(payment_demo)

    # Demo Student Fine
    fine_demo = models.Fine(
        id=str(uuid.uuid4()),
        student_id=stu_demo.id,
        category="Late Entry",
        amount=250.0,
        reason="Reported past 10:00 PM curfew without gate pass",
        status="PENDING",
        issued_by_warden_id=warden.id,
        created_at=datetime.now(timezone.utc) - timedelta(days=4)
    )
    db.add(fine_demo)

    # Demo Student Complaints
    complaint_1 = models.Complaint(
        id=str(uuid.uuid4()),
        complaint_code="CMP-1001",
        student_id=stu_demo.id,
        room_id=room_b204.id,
        title="Wi-Fi Router slow throughput in B-204",
        description="Speed drops significantly during evening peak hours in room B-204.",
        category="Wi-Fi",
        priority="HIGH",
        status="IN_PROGRESS",
        assigned_staff="Mr. Suresh (Network Engineer)",
        resolution_notes="Access point reboot scheduled, checking upstream switch."
    )
    complaint_2 = models.Complaint(
        id=str(uuid.uuid4()),
        complaint_code="CMP-1002",
        student_id=stu_demo.id,
        room_id=room_b204.id,
        title="Ceiling fan regulator loose",
        description="Fan regulator switch knob is loose and needs replacement.",
        category="Electrical",
        priority="MEDIUM",
        status="SUBMITTED"
    )
    db.add_all([complaint_1, complaint_2])

    # 6. Create 19 Other Students (STU002 - STU020)
    student_names = [
        "Rohan Verma", "Priya Sharma", "Aditya Kulkarni", "Neha Patel",
        "Vikram Singh", "Tanvi Joshi", "Siddharth Rao", "Aarav Gupta",
        "Meera Nair", "Karan Deshmukh", "Pooja Hegde", "Rahul Jain",
        "Sneha Roy", "Arjun Reddy", "Divya Menon", "Varun Chopra",
        "Ishaan Malhotra", "Kavya Iyer", "Mohit Bansal"
    ]

    for idx, name in enumerate(student_names, start=2):
        s_code = f"STU{idx:03d}"
        s_user = models.User(
            id=str(uuid.uuid4()),
            username=s_code,
            email=f"stu{idx}@hostelsphere.edu",
            password_hash=get_password_hash("student123"),
            role="STUDENT",
            full_name=name,
            phone=f"+91 98111 {idx:05d}"
        )
        db.add(s_user)
        db.flush()

        # Some inside, some outside
        st_status = "INSIDE" if idx % 3 != 0 else "OUTSIDE"
        student = models.Student(
            id=str(uuid.uuid4()),
            user_id=s_user.id,
            student_code=s_code,
            course="B.Tech Computer Science" if idx % 2 == 0 else "B.Tech Electronics",
            year_of_study=(idx % 4) + 1,
            guardian_name=f"Parent of {name}",
            guardian_phone=f"+91 97000 {idx:05d}",
            current_status=st_status,
            last_entry_at=datetime.now(timezone.utc) - timedelta(hours=idx) if st_status == "INSIDE" else None,
            last_exit_at=datetime.now(timezone.utc) - timedelta(hours=idx) if st_status == "OUTSIDE" else None
        )
        db.add(student)
        db.flush()

        # QR Identity
        qr = models.QrIdentity(
            id=str(uuid.uuid4()),
            student_id=student.id,
            secure_token=f"hs_sec_{s_code.lower()}_{uuid.uuid4().hex[:8]}",
            expires_at=datetime.now(timezone.utc) + timedelta(days=365),
            is_active=True
        )
        db.add(qr)

        # Allocate room
        target_room = rooms_list[(idx - 1) % len(rooms_list)]
        target_bed = next((b for b in beds_list if b.room_id == target_room.id and not b.is_occupied), None)
        if target_bed:
            target_bed.is_occupied = True
            target_room.occupied_count += 1
            if target_room.occupied_count >= target_room.capacity:
                target_room.status = "FULL"
            alloc = models.RoomAllocation(
                id=str(uuid.uuid4()),
                student_id=student.id,
                room_id=target_room.id,
                bed_id=target_bed.id,
                allocated_at=datetime.now(timezone.utc) - timedelta(days=120),
                is_active=True
            )
            db.add(alloc)

        # Student Fee
        fee = models.Fee(
            id=str(uuid.uuid4()),
            student_id=student.id,
            academic_year="2026-2027",
            semester="Semester 5",
            total_amount=45000.0,
            paid_amount=45000.0 if idx % 2 == 0 else 20000.0,
            due_date=datetime.now(timezone.utc) + timedelta(days=20),
            status="PAID" if idx % 2 == 0 else "PARTIAL"
        )
        db.add(fee)

        # Movement logs for live feed
        log_action = "ENTRY" if st_status == "INSIDE" else "EXIT"
        m_log = models.EntryExitLog(
            id=str(uuid.uuid4()),
            student_id=student.id,
            warden_id=warden.id,
            action=log_action,
            timestamp=datetime.now(timezone.utc) - timedelta(minutes=idx * 7),
            gate="MAIN_GATE_1",
            device_info="Gate Reader #01",
            remarks="Routine gate movement"
        )
        db.add(m_log)

    # 7. Announcements
    ann1 = models.Announcement(
        id=str(uuid.uuid4()),
        warden_id=warden.id,
        title="Hostel Annual Maintenance & Wi-Fi Upgrades",
        content="Routine maintenance across Block A and Block B this Saturday from 10:00 AM to 2:00 PM.",
        priority="IMPORTANT",
        target_audience="ALL"
    )
    ann2 = models.Announcement(
        id=str(uuid.uuid4()),
        warden_id=warden.id,
        title="Curfew Timings Strictly 10:00 PM",
        content="All students must mark entry via QR scanning before 10:00 PM. Late passes require prior approval.",
        priority="CRITICAL",
        target_audience="ALL"
    )
    db.add_all([ann1, ann2])

    # 8. Demo Student Notifications
    n1 = models.Notification(
        id=str(uuid.uuid4()),
        user_id=stu_demo_user.id,
        title="Wi-Fi Complaint Acknowledged",
        message="Your complaint CMP-1001 has been assigned to Mr. Suresh.",
        type="INFO"
    )
    n2 = models.Notification(
        id=str(uuid.uuid4()),
        user_id=stu_demo_user.id,
        title="Upcoming Fee Balance",
        message="Remaining balance of ₹10,000 due on October 25, 2026.",
        type="WARNING"
    )
    db.add_all([n1, n2])

    db.commit()
    db.close()
    print("[SEED] Successfully seeded database with Warden, 20 Students, 50 Rooms, and Demo State!")

if __name__ == "__main__":
    seed_database()
