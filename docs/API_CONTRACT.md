# HOSTELSPHERE API Contract Specification
**Version:** 1.0.0
**Source of Truth:** Lead Architect (Agent 01)

---

## 1. Standard Conventions

### 1.1 Base URL
All API endpoints are prefixed with `/api`.

### 1.2 Authentication Header
All authenticated requests must include:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 1.3 Standard Response Formats

#### Successful Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human readable summary"
}
```

#### Error Response
```json
{
  "success": false,
  "error_code": "ERROR_ENUM_STRING",
  "message": "Human-readable description of what went wrong",
  "details": null
}
```

### 1.4 Standard Error Codes
- `INVALID_CREDENTIALS` (HTTP 401)
- `UNAUTHORIZED` (HTTP 401)
- `FORBIDDEN` (HTTP 403)
- `NOT_FOUND` (HTTP 404)
- `INVALID_QR` (HTTP 400)
- `QR_EXPIRED` (HTTP 400)
- `STUDENT_NOT_FOUND` (HTTP 404)
- `ALREADY_INSIDE` (HTTP 409)
- `ALREADY_OUTSIDE` (HTTP 409)
- `ROOM_FULL` (HTTP 409)
- `COMPLAINT_NOT_FOUND` (HTTP 404)
- `VALIDATION_ERROR` (HTTP 422)

---

## 2. Authentication Endpoints

### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "STU001", // or WARDEN001
  "password": "student123" // or warden123
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "u-001",
      "username": "STU001",
      "role": "STUDENT",
      "full_name": "Aniket Gaikwad",
      "student_id": "s-001"
    }
  }
}
```

### `POST /api/auth/logout`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### `GET /api/auth/me`
- **Access**: Authenticated
- **Response (200 OK)**: Returns the current user object and associated Student/Warden record.

---

## 3. QR Identity & Verification Endpoints

### `GET /api/qr/student`
- **Access**: Student Only
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "qr_id": "qr-998",
    "student_id": "s-001",
    "student_name": "Aniket Gaikwad",
    "student_code": "STU001",
    "hostel_name": "Block B",
    "room_number": "B-204",
    "secure_token": "hs_sec_89234fd98234",
    "scan_url": "http://192.168.1.5:3000/scan?token=hs_sec_89234fd98234",
    "created_at": "2026-10-08T00:00:00Z",
    "expires_at": "2026-10-09T00:00:00Z",
    "is_active": true
  }
}
```

### `POST /api/qr/validate`
- **Access**: Public (Preview for Scanner before login)
- **Request Body**:
```json
{
  "token": "hs_sec_89234fd98234"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "student_id": "s-001",
    "student_name": "Aniket Gaikwad",
    "student_code": "STU001",
    "room_number": "B-204",
    "block_name": "Block B",
    "current_status": "OUTSIDE"
  }
}
```

### `POST /api/qr/scan`
- **Access**: Warden Only
- **Request Body**:
```json
{
  "token": "hs_sec_89234fd98234"
}
```
- **Response (200 OK)**: Returns full student object including complete movement status and room details.

---

## 4. Hostel Movement (Entry / Exit) Endpoints

### `POST /api/movement/entry`
- **Access**: Warden Only
- **Request Body**:
```json
{
  "student_id": "s-001",
  "gate": "MAIN_GATE_1",
  "device_info": "Warden Mobile / Scanner",
  "remarks": "On-time arrival"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Student marked INSIDE successfully",
  "data": {
    "log_id": "mov-1002",
    "student_id": "s-001",
    "action": "ENTRY",
    "timestamp": "2026-10-08T20:45:00Z",
    "current_status": "INSIDE"
  }
}
```
- **Error (409 Conflict)**:
```json
{
  "success": false,
  "error_code": "ALREADY_INSIDE",
  "message": "Student is already inside the hostel."
}
```

### `POST /api/movement/exit`
- **Access**: Warden Only
- **Request Body**:
```json
{
  "student_id": "s-001",
  "gate": "MAIN_GATE_1",
  "device_info": "Warden Mobile / Scanner",
  "remarks": "Library visit"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Student marked OUTSIDE successfully",
  "data": {
    "log_id": "mov-1003",
    "student_id": "s-001",
    "action": "EXIT",
    "timestamp": "2026-10-08T20:50:00Z",
    "current_status": "OUTSIDE"
  }
}
```
- **Error (409 Conflict)**:
```json
{
  "success": false,
  "error_code": "ALREADY_OUTSIDE",
  "message": "Student is already outside the hostel."
}
```

### `GET /api/movement/student/{id}`
- **Access**: Student (own id) or Warden
- **Response (200 OK)**: Returns chronological entry/exit logs for student.

### `GET /api/movement/live`
- **Access**: Warden Only
- **Response (200 OK)**: Returns recent 20 live movements across hostel gates.

---

## 5. Student Self-Service Endpoints

### `GET /api/students/me`
- **Access**: Student Only
- Returns profile, status (`INSIDE`/`OUTSIDE`), room, warden contact, emergency info.

### `GET /api/students/me/room`
- Returns assigned room number, block, floor, roommates, amenities.

### `GET /api/students/me/fees`
- Returns breakdown of total fees, paid amount, pending balance, due dates.

### `GET /api/students/me/fines`
- Returns list of issued fines, statuses (`PENDING`, `PAID`, `WAIVED`).

### `GET /api/students/me/complaints`
- Returns complaints created by this student.

### `GET /api/students/me/activity`
- Returns movement history, fee receipts, fine notices.

---

## 6. Warden Operational Endpoints

### `GET /api/warden/dashboard`
- **Access**: Warden Only
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "total_students": 500,
    "inside_count": 427,
    "outside_count": 73,
    "available_rooms": 24,
    "pending_complaints": 18,
    "urgent_complaints": 3,
    "outstanding_fees": 480000,
    "recent_movements": [ ... ]
  }
}
```

### `GET /api/warden/students`
- Query params: `search`, `block`, `status`, `page`, `limit`
- Returns paginated list of students with filterable criteria.

### `GET /api/warden/students/{id}`
- Returns deep profile: full movement timeline, complaints, fee ledger, fines.

---

## 7. Complaints Lifecycle Endpoints

### `POST /api/complaints`
- **Access**: Student Only
- **Request Body**:
```json
{
  "title": "Leaking faucet in washroom",
  "description": "Continuous leak in bathroom 2, second floor.",
  "category": "Plumbing",
  "priority": "HIGH" // LOW | MEDIUM | HIGH | URGENT
}
```

### `GET /api/complaints`
- **Access**: Student (gets own) or Warden (gets all)
- Query params: `status`, `category`, `priority`

### `PATCH /api/complaints/{id}/status`
- **Access**: Warden Only
- **Request Body**:
```json
{
  "status": "IN_PROGRESS", // SUBMITTED | ACKNOWLEDGED | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED
  "assigned_staff": "Mr. Ramesh (Plumber)",
  "resolution_notes": "Parts ordered, fixing at 4pm"
}
```

---

## 8. Rooms & Allocation Endpoints

### `GET /api/rooms`
- Returns blocks, floors, room occupancy, available beds.

### `POST /api/rooms/{id}/allocate`
- **Access**: Warden Only
- **Request Body**:
```json
{
  "student_id": "s-001",
  "bed_number": "B2"
}
```

### `POST /api/rooms/{id}/vacate`
- **Access**: Warden Only
- Vacates student and marks bed available.

---

## 9. Finance (Fees & Fines) Endpoints

### `GET /api/fees`
- Aggregated financial metrics for Warden.

### `GET /api/fines`
- List of fines.

### `POST /api/fines`
- **Access**: Warden Only
- Issue a fine for Late Entry, Rule Violation, Property Damage, etc.

---

## 10. Announcements, Leave & SOS Endpoints

### `GET /api/announcements` & `POST /api/announcements`
- Hostel announcements broadcasted to all students.

### `POST /api/emergency`
- Instant SOS alert triggered by student with location and instant Warden alert.

### `POST /api/leave` & `PATCH /api/leave/{id}`
- Student gate pass / outstation leave application and Warden approval.

---

## 11. WebSocket Endpoint

### `WS /ws`
- Clients connect with `?token=<JWT>`.
- Server pushes JSON frames:
  ```json
  {
    "type": "MOVEMENT_UPDATE",
    "payload": {
      "student_name": "Aniket Gaikwad",
      "room_number": "B-204",
      "action": "ENTRY",
      "inside_count": 428,
      "outside_count": 72,
      "timestamp": "2026-10-08T20:45:00Z"
    }
  }
  ```
