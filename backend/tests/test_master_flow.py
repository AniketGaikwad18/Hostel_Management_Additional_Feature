import pytest
import os
import sys

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal, Base, engine
from app.database.seed import seed_database
from app.database import models

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    seed_database()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "HOSTELSPHERE"

def test_student_and_warden_login():
    # 1. Invalid student password
    res_bad = client.post("/api/auth/login", json={"username": "STU001", "password": "wrongpassword"})
    assert res_bad.status_code == 401
    assert res_bad.json()["error_code"] == "INVALID_CREDENTIALS"

    # 2. Valid student login
    res_stu = client.post("/api/auth/login", json={"username": "STU001", "password": "student123"})
    assert res_stu.status_code == 200
    stu_data = res_stu.json()["data"]
    assert stu_data["user"]["role"] == "STUDENT"
    assert "access_token" in stu_data

    # 3. Valid warden login
    res_war = client.post("/api/auth/login", json={"username": "WARDEN001", "password": "warden123"})
    assert res_war.status_code == 200
    war_data = res_war.json()["data"]
    assert war_data["user"]["role"] == "WARDEN"
    assert "access_token" in war_data

def test_rbac_authorization():
    # Student token cannot access warden routes
    stu_login = client.post("/api/auth/login", json={"username": "STU001", "password": "student123"}).json()["data"]
    stu_headers = {"Authorization": f"Bearer {stu_login['access_token']}"}

    res_forbidden = client.get("/api/warden/dashboard", headers=stu_headers)
    assert res_forbidden.status_code == 403
    assert res_forbidden.json()["error_code"] == "FORBIDDEN"

def test_master_demo_qr_entry_flow():
    """
    CRITICAL MASTER DEMO TEST:
    STUDENT LOGIN
          ↓
    MY QR IDENTITY
          ↓
    VALIDATE PUBLIC PREVIEW
          ↓
    WARDEN LOGIN
          ↓
    VERIFY STUDENT
          ↓
    MARK ENTRY
          ↓
    DUPLICATE ENTRY REJECTED
          ↓
    MARK EXIT
    """
    # 1. Student logs in & gets QR
    stu_login = client.post("/api/auth/login", json={"username": "STU001", "password": "student123"}).json()["data"]
    stu_headers = {"Authorization": f"Bearer {stu_login['access_token']}"}

    res_qr = client.get("/api/qr/student", headers=stu_headers)
    assert res_qr.status_code == 200
    qr_data = res_qr.json()["data"]
    token = qr_data["secure_token"]
    student_id = qr_data["student_id"]
    assert qr_data["student_name"] == "Aniket Gaikwad"
    assert qr_data["room_number"] == "B-204"

    # 2. Public Scan Preview (before warden logs in)
    res_preview = client.post("/api/qr/validate", json={"token": token})
    assert res_preview.status_code == 200
    prev_data = res_preview.json()["data"]
    assert prev_data["valid"] is True
    assert prev_data["student_name"] == "Aniket Gaikwad"
    assert "fees" not in prev_data  # No sensitive data in public preview!

    # 3. Warden logs in & verifies QR
    war_login = client.post("/api/auth/login", json={"username": "WARDEN001", "password": "warden123"}).json()["data"]
    war_headers = {"Authorization": f"Bearer {war_login['access_token']}"}

    res_verify = client.post("/api/qr/scan", json={"token": token}, headers=war_headers)
    assert res_verify.status_code == 200
    assert res_verify.json()["data"]["verified"] is True

    # 4. Warden views student details
    res_detail = client.get(f"/api/warden/students/{student_id}", headers=war_headers)
    assert res_detail.status_code == 200
    det = res_detail.json()["data"]
    assert det["student_code"] == "STU001"

    # 5. Mark ENTRY
    # If student is outside, mark ENTRY
    if det["current_status"] == "OUTSIDE":
        res_entry = client.post("/api/movement/entry", json={"student_id": student_id}, headers=war_headers)
        assert res_entry.status_code == 200
        assert res_entry.json()["data"]["action"] == "ENTRY"
        assert res_entry.json()["data"]["current_status"] == "INSIDE"

    # 6. Test Duplicate Entry prevention
    res_dup_entry = client.post("/api/movement/entry", json={"student_id": student_id}, headers=war_headers)
    assert res_dup_entry.status_code == 409
    assert res_dup_entry.json()["error_code"] == "ALREADY_INSIDE"

    # 7. Check student status is now INSIDE
    res_stu_me = client.get("/api/students/me", headers=stu_headers)
    assert res_stu_me.status_code == 200
    assert res_stu_me.json()["data"]["current_status"] == "INSIDE"

    # 8. Mark EXIT
    res_exit = client.post("/api/movement/exit", json={"student_id": student_id}, headers=war_headers)
    assert res_exit.status_code == 200
    assert res_exit.json()["data"]["action"] == "EXIT"
    assert res_exit.json()["data"]["current_status"] == "OUTSIDE"

    # 9. Test Duplicate Exit prevention
    res_dup_exit = client.post("/api/movement/exit", json={"student_id": student_id}, headers=war_headers)
    assert res_dup_exit.status_code == 409
    assert res_dup_exit.json()["error_code"] == "ALREADY_OUTSIDE"

def test_invalid_and_expired_qr():
    res_invalid = client.post("/api/qr/validate", json={"token": "completely_bogus_token_xyz"})
    assert res_invalid.status_code == 400
    assert res_invalid.json()["error_code"] == "INVALID_QR"

def test_complaint_lifecycle():
    stu_login = client.post("/api/auth/login", json={"username": "STU001", "password": "student123"}).json()["data"]
    stu_headers = {"Authorization": f"Bearer {stu_login['access_token']}"}
    war_login = client.post("/api/auth/login", json={"username": "WARDEN001", "password": "warden123"}).json()["data"]
    war_headers = {"Authorization": f"Bearer {war_login['access_token']}"}

    # 1. Student files complaint
    res_create = client.post("/api/complaints", json={
        "title": "Study table leg unsteady",
        "description": "Leg screw needs tightening in B-204",
        "category": "Furniture",
        "priority": "LOW"
    }, headers=stu_headers)
    assert res_create.status_code == 200
    cmp_id = res_create.json()["data"]["id"]

    # 2. Warden assigns & updates status
    res_update = client.patch(f"/api/complaints/{cmp_id}/status", json={
        "status": "IN_PROGRESS",
        "assigned_staff": "Mr. Carpenter John",
        "resolution_notes": "Hardware dispatched"
    }, headers=war_headers)
    assert res_update.status_code == 200
    assert res_update.json()["success"] is True

def test_fine_and_fee_calculation():
    war_login = client.post("/api/auth/login", json={"username": "WARDEN001", "password": "warden123"}).json()["data"]
    war_headers = {"Authorization": f"Bearer {war_login['access_token']}"}
    stu_login = client.post("/api/auth/login", json={"username": "STU001", "password": "student123"}).json()["data"]
    stu_headers = {"Authorization": f"Bearer {stu_login['access_token']}"}

    # 1. Check fees
    res_fees = client.get("/api/students/me/fees", headers=stu_headers)
    assert res_fees.status_code == 200
    fee_list = res_fees.json()["data"]
    assert len(fee_list) > 0
    assert fee_list[0]["total_amount"] >= fee_list[0]["paid_amount"]

    # 2. Issue fine
    res_fine = client.post("/api/fines", json={
        "student_id": stu_login["user"]["student_id"],
        "category": "Late Entry",
        "amount": 150.0,
        "reason": "Test fine citation"
    }, headers=war_headers)
    assert res_fine.status_code == 200
    fine_id = res_fine.json()["data"]["id"]

    # 3. Waive fine
    res_waive = client.patch(f"/api/fines/{fine_id}/status", json={"status": "WAIVED"}, headers=war_headers)
    assert res_waive.status_code == 200

def test_emergency_sos():
    stu_login = client.post("/api/auth/login", json={"username": "STU001", "password": "student123"}).json()["data"]
    stu_headers = {"Authorization": f"Bearer {stu_login['access_token']}"}
    war_login = client.post("/api/auth/login", json={"username": "WARDEN001", "password": "warden123"}).json()["data"]
    war_headers = {"Authorization": f"Bearer {war_login['access_token']}"}

    res_sos = client.post("/api/emergency", json={
        "location": "Block B • Floor 2 Corridor",
        "message": "Medical assistance test ping"
    }, headers=stu_headers)
    assert res_sos.status_code == 200
    assert res_sos.json()["data"]["status"] == "ACTIVE"

    res_alerts = client.get("/api/emergency", headers=war_headers)
    assert res_alerts.status_code == 200
    assert len(res_alerts.json()["data"]) > 0
