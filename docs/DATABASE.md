# HOSTELSPHERE Database Schema Specification
**Version:** 1.0.0
**Source of Truth:** Lead Architect (Agent 01) & Database Engineer (Agent 02)

---

## 1. Schema Diagram & Relationships

```
             ┌───────────────┐
             │     Users     │
             └──┬─────────┬──┘
                │1        │1
                │         │
                ▼1        ▼1
      ┌───────────┐     ┌───────────┐
      │ Students  │     │  Wardens  │
      └─┬───┬─┬───┘     └─────┬─────┘
        │   │ │               │
        │   │ └───────┐       │
        │1  │1        │1      │
        ▼1  ▼*        ▼*      ▼*
┌─────────┐ ┌─────────┐ ┌───────────────┐
│QR Token │ │Complaints│ │Entry/Exit Log │
└─────────┘ └─────────┘ └───────────────┘
        │1
        ▼*
┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Room Allocations │ ──> │    Rooms     │ ──> │    Blocks    │
└──────────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Table Definitions

### 2.1 `users`
- `id` (VARCHAR(36), PK): UUID
- `username` (VARCHAR(64), UNIQUE, INDEX): e.g. `STU001`, `WARDEN001`
- `email` (VARCHAR(128), UNIQUE): e.g. `aniket@university.edu`
- `password_hash` (VARCHAR(256)): bcrypt hash
- `role` (VARCHAR(20), INDEX): `STUDENT`, `WARDEN`, `ADMIN`
- `full_name` (VARCHAR(128))
- `phone` (VARCHAR(20))
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 2.2 `wardens`
- `id` (VARCHAR(36), PK): UUID
- `user_id` (VARCHAR(36), FK -> `users.id`, UNIQUE)
- `employee_id` (VARCHAR(64), UNIQUE)
- `designation` (VARCHAR(64)): e.g. `Chief Hostel Warden`
- `office_contact` (VARCHAR(32))
- `created_at` (DATETIME)

### 2.3 `students`
- `id` (VARCHAR(36), PK): UUID
- `user_id` (VARCHAR(36), FK -> `users.id`, UNIQUE)
- `student_code` (VARCHAR(32), UNIQUE, INDEX): e.g. `STU001`
- `course` (VARCHAR(64)): e.g. `B.Tech Computer Science`
- `year_of_study` (INTEGER): e.g. `3`
- `guardian_name` (VARCHAR(128))
- `guardian_phone` (VARCHAR(32))
- `current_status` (VARCHAR(20), DEFAULT 'OUTSIDE', INDEX): `INSIDE`, `OUTSIDE`
- `last_entry_at` (DATETIME, NULLABLE)
- `last_exit_at` (DATETIME, NULLABLE)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 2.4 `hostels`
- `id` (VARCHAR(36), PK)
- `name` (VARCHAR(128)): e.g. `Aryabhatta Residential Complex`
- `code` (VARCHAR(32), UNIQUE)

### 2.5 `blocks`
- `id` (VARCHAR(36), PK)
- `hostel_id` (VARCHAR(36), FK -> `hostels.id`)
- `name` (VARCHAR(64)): e.g. `Block A`, `Block B`
- `total_floors` (INTEGER, DEFAULT 4)

### 2.6 `floors`
- `id` (VARCHAR(36), PK)
- `block_id` (VARCHAR(36), FK -> `blocks.id`)
- `floor_number` (INTEGER)

### 2.7 `rooms`
- `id` (VARCHAR(36), PK)
- `floor_id` (VARCHAR(36), FK -> `floors.id`)
- `block_id` (VARCHAR(36), FK -> `blocks.id`)
- `room_number` (VARCHAR(32), INDEX): e.g. `B-204`
- `capacity` (INTEGER, DEFAULT 4)
- `occupied_count` (INTEGER, DEFAULT 0)
- `status` (VARCHAR(20), DEFAULT 'AVAILABLE'): `AVAILABLE`, `FULL`, `MAINTENANCE`

### 2.8 `beds`
- `id` (VARCHAR(36), PK)
- `room_id` (VARCHAR(36), FK -> `rooms.id`)
- `bed_number` (VARCHAR(16)): e.g. `B1`, `B2`, `B3`, `B4`
- `is_occupied` (BOOLEAN, DEFAULT FALSE)

### 2.9 `room_allocations`
- `id` (VARCHAR(36), PK)
- `student_id` (VARCHAR(36), FK -> `students.id`, INDEX)
- `room_id` (VARCHAR(36), FK -> `rooms.id`)
- `bed_id` (VARCHAR(36), FK -> `beds.id`)
- `allocated_at` (DATETIME)
- `vacated_at` (DATETIME, NULLABLE)
- `is_active` (BOOLEAN, DEFAULT TRUE, INDEX)

### 2.10 `qr_identities` (Security Core)
- `id` (VARCHAR(36), PK)
- `student_id` (VARCHAR(36), FK -> `students.id`, UNIQUE, INDEX)
- `secure_token` (VARCHAR(128), UNIQUE, INDEX): Random cryptographically secure token
- `created_at` (DATETIME)
- `expires_at` (DATETIME)
- `is_active` (BOOLEAN, DEFAULT TRUE)
*Rule:* QR never stores student plaintext information. Only this unguessable `secure_token` is included in the scan URL.

### 2.11 `entry_exit_logs`
- `id` (VARCHAR(36), PK)
- `student_id` (VARCHAR(36), FK -> `students.id`, INDEX)
- `warden_id` (VARCHAR(36), FK -> `wardens.id`, NULLABLE)
- `action` (VARCHAR(20), INDEX): `ENTRY`, `EXIT`
- `timestamp` (DATETIME, INDEX)
- `gate` (VARCHAR(64), DEFAULT 'MAIN_GATE')
- `device_info` (VARCHAR(256), DEFAULT 'Handheld Terminal')
- `remarks` (TEXT, NULLABLE)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 2.12 `complaints`
- `id` (VARCHAR(36), PK)
- `complaint_code` (VARCHAR(32), UNIQUE, INDEX): e.g. `CMP-1001`
- `student_id` (VARCHAR(36), FK -> `students.id`, INDEX)
- `room_id` (VARCHAR(36), FK -> `rooms.id`, NULLABLE)
- `title` (VARCHAR(256))
- `description` (TEXT)
- `category` (VARCHAR(64)): `Electrical`, `Plumbing`, `Wi-Fi`, `Cleaning`, `Furniture`, `Food`, `Water`, `Security`, `Maintenance`, `Other`
- `priority` (VARCHAR(20)): `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `status` (VARCHAR(32), DEFAULT 'SUBMITTED', INDEX): `SUBMITTED`, `ACKNOWLEDGED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- `assigned_staff` (VARCHAR(128), NULLABLE)
- `resolution_notes` (TEXT, NULLABLE)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 2.13 `complaint_updates`
- `id` (VARCHAR(36), PK)
- `complaint_id` (VARCHAR(36), FK -> `complaints.id`)
- `status` (VARCHAR(32))
- `comment` (TEXT)
- `updated_by` (VARCHAR(128))
- `created_at` (DATETIME)

### 2.14 `fees`
- `id` (VARCHAR(36), PK)
- `student_id` (VARCHAR(36), FK -> `students.id`, INDEX)
- `academic_year` (VARCHAR(32)): e.g. `2026-2027`
- `semester` (VARCHAR(16)): e.g. `Semester 5`
- `total_amount` (DECIMAL(10,2))
- `paid_amount` (DECIMAL(10,2), DEFAULT 0.0)
- `due_date` (DATETIME)
- `status` (VARCHAR(20)): `PAID`, `PARTIAL`, `PENDING`, `OVERDUE`

### 2.15 `fee_payments`
- `id` (VARCHAR(36), PK)
- `fee_id` (VARCHAR(36), FK -> `fees.id`)
- `transaction_ref` (VARCHAR(64), UNIQUE)
- `amount` (DECIMAL(10,2))
- `payment_method` (VARCHAR(32)): `UPI`, `NetBanking`, `Card`, `Cash`
- `paid_at` (DATETIME)

### 2.16 `fines`
- `id` (VARCHAR(36), PK)
- `student_id` (VARCHAR(36), FK -> `students.id`, INDEX)
- `category` (VARCHAR(64)): `Late Entry`, `Rule Violation`, `Property Damage`, `Other`
- `amount` (DECIMAL(10,2))
- `reason` (TEXT)
- `status` (VARCHAR(20), DEFAULT 'PENDING'): `PENDING`, `PAID`, `WAIVED`
- `issued_by_warden_id` (VARCHAR(36), FK -> `wardens.id`, NULLABLE)
- `created_at` (DATETIME)

### 2.17 `notifications`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> `users.id`, INDEX)
- `title` (VARCHAR(256))
- `message` (TEXT)
- `type` (VARCHAR(32)): `INFO`, `WARNING`, `URGENT`, `SUCCESS`
- `is_read` (BOOLEAN, DEFAULT FALSE)
- `created_at` (DATETIME)

### 2.18 `announcements`
- `id` (VARCHAR(36), PK)
- `warden_id` (VARCHAR(36), FK -> `wardens.id`, NULLABLE)
- `title` (VARCHAR(256))
- `content` (TEXT)
- `priority` (VARCHAR(20)): `NORMAL`, `IMPORTANT`, `CRITICAL`
- `target_audience` (VARCHAR(32), DEFAULT 'ALL'): `ALL`, `BLOCK_A`, `BLOCK_B`
- `created_at` (DATETIME)

### 2.19 `leave_requests`
- `id` (VARCHAR(36), PK)
- `student_id` (VARCHAR(36), FK -> `students.id`, INDEX)
- `start_date` (DATETIME)
- `end_date` (DATETIME)
- `destination` (VARCHAR(256))
- `reason` (TEXT)
- `status` (VARCHAR(20), DEFAULT 'PENDING'): `PENDING`, `APPROVED`, `REJECTED`
- `approved_by_warden_id` (VARCHAR(36), FK -> `wardens.id`, NULLABLE)
- `created_at` (DATETIME)

### 2.20 `emergency_alerts` (SOS)
- `id` (VARCHAR(36), PK)
- `student_id` (VARCHAR(36), FK -> `students.id`, INDEX)
- `location` (VARCHAR(128))
- `message` (TEXT)
- `status` (VARCHAR(20), DEFAULT 'ACTIVE'): `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`
- `created_at` (DATETIME)

### 2.21 `audit_logs`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), NULLABLE)
- `action` (VARCHAR(64))
- `entity` (VARCHAR(64))
- `entity_id` (VARCHAR(64))
- `details` (TEXT)
- `ip_address` (VARCHAR(64), NULLABLE)
- `created_at` (DATETIME)

---

## 3. Seed Data Blueprint
- **1 Warden**:
  - Username: `WARDEN001`
  - Password: `warden123`
  - Name: `Dr. Rajesh Sharma`
  - Designation: `Chief Hostel Warden`
- **Demo Student**:
  - Username: `STU001`
  - Password: `student123`
  - Name: `Aniket Gaikwad`
  - Student ID: `STU001`
  - Hostel: `Block B`
  - Room: `B-204`
  - Status: `OUTSIDE`
- **19 Additional Students** (STU002 to STU020) allocated across Block A and Block B rooms with diverse statuses, sample complaints, fee payment records, and fines.
- **2 Blocks**: Block A (Boys Hostel), Block B (Boys Hostel).
- **50 Rooms**: With calculated occupancy to match demonstration stats: Total Students = 500, Inside = 427, Outside = 73, Available Rooms = 24.
