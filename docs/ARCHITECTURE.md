# HOSTELSPHERE Architecture Specification
**Tagline:** "One Hostel. One Platform."
**Version:** 1.0.0
**Author:** Lead Architect (Agent 01)

---

## 1. System Overview & Philosophy
HOSTELSPHERE is a unified, real-time University Hostel Management System designed for zero-latency operations, frictionless student entry/exit verification via secure QR tokens, and operational hostel management for Wardens.

The architecture strictly follows a **layered separation of concerns**:
```
┌────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                   │
│  - Student Portal (Mobile-First)                       │
│  - Warden Operations Center (Desktop-First)            │
│  - Universal QR Scanner & Fallback Token Entry         │
└───────────────────────────┬────────────────────────────┘
                            │ REST / WebSockets / JSON
┌───────────────────────────▼────────────────────────────┐
│                  Backend (FastAPI)                     │
│  - Router Layer (Input Validation & Role Auth)         │
│  - Service Layer (Business Logic & State Transitions)   │
│  - Real-Time Broadcast Hub (WebSockets / Fallback)     │
└───────────────────────────┬────────────────────────────┘
                            │ SQLAlchemy ORM
┌───────────────────────────▼────────────────────────────┐
│                  Database Layer                        │
│  - SQLite (Local Dev / Demo Zero-Config)               │
│  - PostgreSQL compatible dialect                       │
│  - Complete Relational Schema (20+ entities)           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Repository Structure
```
Hostel_main/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── students.py
│   │   │   ├── warden.py
│   │   │   ├── qr.py
│   │   │   ├── movement.py
│   │   │   ├── complaints.py
│   │   │   ├── rooms.py
│   │   │   ├── fees.py
│   │   │   ├── fines.py
│   │   │   ├── announcements.py
│   │   │   ├── emergency.py
│   │   │   ├── leave.py
│   │   │   └── ws.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── errors.py
│   │   │   └── websocket_hub.py
│   │   ├── database/
│   │   │   ├── session.py
│   │   │   ├── models.py
│   │   │   └── seed.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── student.py
│   │   │   ├── warden.py
│   │   │   ├── qr.py
│   │   │   ├── movement.py
│   │   │   ├── complaint.py
│   │   │   ├── room.py
│   │   │   ├── finance.py
│   │   │   └── common.py
│   │   ├── services/
│   │   │   ├── movement_service.py
│   │   │   ├── qr_service.py
│   │   │   ├── complaint_service.py
│   │   │   ├── room_service.py
│   │   │   └── notification_service.py
│   │   └── main.py
│   ├── requirements.txt
│   └── run_backend.py
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Landing & Role selection
│   │   │   ├── login/page.tsx         # Unified Auth Login
│   │   │   ├── scan/page.tsx          # QR Scan Entry point (judge/phone)
│   │   │   ├── student/
│   │   │   │   ├── layout.tsx         # Mobile-first navigation bar
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── qr/page.tsx        # High-visibility Student QR Identity
│   │   │   │   ├── activity/page.tsx
│   │   │   │   ├── complaints/page.tsx
│   │   │   │   ├── fees/page.tsx
│   │   │   │   ├── fines/page.tsx
│   │   │   │   ├── room/page.tsx
│   │   │   │   ├── leave/page.tsx
│   │   │   │   ├── announcements/page.tsx
│   │   │   │   ├── notifications/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   └── warden/
│   │   │       ├── layout.tsx         # Operations Center sidebar & topbar
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── scanner/page.tsx   # Camera QR scanner + manual token
│   │   │       ├── live-hostel/page.tsx
│   │   │       ├── students/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/page.tsx  # Student Detail & Mark Entry/Exit
│   │   │       ├── rooms/page.tsx
│   │   │       ├── allocation/page.tsx
│   │   │       ├── complaints/page.tsx
│   │   │       ├── fees/page.tsx
│   │   │       ├── fines/page.tsx
│   │   │       ├── leave/page.tsx
│   │   │       ├── announcements/page.tsx
│   │   │       ├── emergency/page.tsx
│   │   │       ├── analytics/page.tsx
│   │   │       └── reports/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable primitive components
│   │   │   ├── student/               # Student widgets & cards
│   │   │   ├── warden/                # Warden charts & operational tables
│   │   │   └── shared/                # QR Code viewer, scanner frame, alerts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios/Fetch client with token handling
│   │   │   ├── constants.ts
│   │   │   ├── types.ts               # Shared TypeScript schemas
│   │   │   └── utils.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── DATABASE.md
│   └── DEMO_FLOW.md
├── start_demo.bat
├── start_demo.sh
└── README.md
```

---

## 3. Technology Stack Decisions
1. **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS.
   - Styling Palette:
     - **Periwinkle (`#9FA8FF`)**: Primary brand, active states, key interactive highlights.
     - **Pure Black (`#000000`) & Deep Dark Surfaces (`#0A0A0E`, `#121218`)**: Sleek, high-contrast, premium aesthetic.
     - **Coral Red (`#FF5A5F`)**: OUTSIDE status, urgent complaints, SOS alerts, danger actions.
     - **Semantic Status Green (`#10B981`)**: Minimal highlight for INSIDE verified status.
     - **White (`#FFFFFF`)**: Crisp, readable typography.
   - Icons: `lucide-react`.
   - Charts: `recharts`.
   - QR: `qrcode.react` (generating SVGs), `html5-qrcode` + custom fallback input (scanning).

2. **Backend**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2.
   - Architecture: Clean Architecture (Routers -> Services -> Models -> Session).
   - Async WebSockets for real-time live events.

3. **Database**: SQLite default for zero-friction local execution (file: `backend/hostelsphere.db`), configured with foreign key constraints, connection pooling, and easily swappable to PostgreSQL via `DATABASE_URL`.

---

## 4. Authentication & Role-Based Authorization
- **Token Mechanism**: Standard JSON Web Tokens (JWT) using `HS256` signed with `SECRET_KEY`.
- **Payload**:
  ```json
  {
    "sub": "user_id_uuid",
    "role": "STUDENT" | "WARDEN",
    "identifier": "STU001" | "WARDEN001",
    "student_id": "student_uuid",
    "exp": 1791234567
  }
  ```
- **Access Control Enforcement**:
  - Backend dependencies `get_current_user`, `require_warden`, `require_student`.
  - Frontend middleware / route guards in Next.js ensuring students cannot navigate to `/warden/*` and unauthenticated users are redirected to `/login`.

---

## 5. QR Code Architecture & Privacy Guarantee
### Threat Model & Privacy Rule:
- **Zero Sensitive Data In QR**: The QR code strictly encodes an opaque URL containing only an unguessable cryptographic token:
  `http://<SERVER_IP>:3000/scan?token=<SECURE_TOKEN>`
- **No Personal Identifiable Information (PII)**: QR never contains student name, phone, grades, fees, fines, or room secrets.
- **Two-Stage Validation**:
  1. *Public Token Preview*: Scanning shows minimal public verification (Student Name initials/masked name, photo badge, status "OUTSIDE/INSIDE", and "CONTINUE TO WARDEN LOGIN").
  2. *Warden Authorized View*: Once the Warden authenticates, the system validates the token against the active database record, returning full records (room details, fee arrears, parent contact, disciplinary history, entry/exit toggle).

---

## 6. Real-Time Network & Synchronization
- **Primary Mechanism**: FastAPI WebSocket endpoint at `/ws`.
- **Fallback**: 5-second polling on dashboard metrics if WebSockets encounter proxy/network disconnection.
- **Event Broadcasts**:
  - `MOVEMENT_RECORDED`: Updates Warden inside/outside counters, logs table, and student's personal status badge.
  - `COMPLAINT_UPDATED`: Real-time Kanban board updates.
  - `EMERGENCY_TRIGGERED`: Audible and visual flash banner for Wardens.

---

## 7. Local Network Deployment (Demo-Ready)
- Backend binds to `0.0.0.0:8000`.
- Frontend binds to `0.0.0.0:3000`.
- Configured via environment variable:
  - `NEXT_PUBLIC_APP_URL=http://<YOUR_IP>:3000`
  - `NEXT_PUBLIC_API_URL=http://<YOUR_IP>:8000`
- Any mobile phone connected to the same Wi-Fi or mobile hotspot can directly resolve the QR code without third-party cloud tunneling.
