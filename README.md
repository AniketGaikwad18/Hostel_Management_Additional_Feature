# HOSTELSPHERE
> **Tagline:** "One Hostel. One Platform."  
> **Unified University Hostel Management System**

HOSTELSPHERE is a complete, production-grade University Hostel Management platform engineered for real-time gate telemetry, high-contrast cryptographic QR identity verification, and operational facilities management.

---

## 🌟 The Core Demonstration Flow (Tomorrow's Presentation)

```
LAPTOP (STUDENT SCREEN)
  1. Student logs in: STU001 / student123
  2. Opens "MY QR IDENTITY" (/student/qr)
  3. Displays high-contrast tokenized QR code for Aniket Gaikwad (Room B-204)
         │
         ▼
JUDGE'S PHONE (CAMERA)
  4. Judge points phone camera at laptop screen
  5. Phone browser opens local network URL:
     http://<LAPTOP_IP>:3000/scan?token=hs_sec_aniket_stu001_demo
         │
         ▼
HOSTELSPHERE PHONE PREVIEW (/scan)
  6. Displays "QR DETECTED ✓" with student verification badge
  7. Protects sensitive data (fees, parent phone, grades shielded)
  8. Judge/Warden taps: "CONTINUE TO WARDEN LOGIN"
         │
         ▼
WARDEN AUTHENTICATION (/login)
  9. Warden enters credentials: WARDEN001 / warden123
 10. Automatically verifies student cryptographic token
         │
         ▼
STUDENT VERIFIED & DOSSIER (/warden/students/s-001?source=qr)
 11. Complete student record displays with quarters & disciplinary standing
 12. Warden taps: [ MARK ENTRY ]
 13. System validates student was OUTSIDE, records immutable entry log, and updates status to INSIDE
 14. Displays green banner: "✓ ENTRY RECORDED FOR ANIKET GAIKWAD"
         │
         ▼
REAL-TIME SYNCHRONIZATION (WEBSOCKETS)
 15. Warden Operations Dashboard updates live:
     • INSIDE: 427 ➔ 428
     • OUTSIDE: 73 ➔ 72
     • Live activity panel immediately shows: "Aniket Gaikwad | B-204 | 🟢 INSIDE | Just now"
 16. Student screen flips immediately to: 🟢 INSIDE
```

---

## 🚀 Quickstart: Running the Application Locally

### Automated Windows Launcher:
Double-click `start_demo.bat` in the project root.  
It automatically detects your local IPv4 address, boots the FastAPI backend on `0.0.0.0:8000`, and launches Next.js on `0.0.0.0:3000`.

---

### Manual Launch Instructions:

#### 1. Start Backend:
```bash
cd backend
python run_backend.py
```
*Backend runs on `http://0.0.0.0:8000` with interactive API documentation at `http://localhost:8000/docs`.*

#### 2. Start Frontend:
```bash
cd frontend
npm run dev -- -H 0.0.0.0
```
*Frontend runs on `http://0.0.0.0:3000` and is accessible across all local network devices.*

---

## 📱 Local Network / Phone Wi-Fi Setup

To allow a phone or judge's mobile device to scan the laptop QR code:

1. **Connect to the Same Network:**
   - Connect both laptop and phone to the same Wi-Fi router, OR
   - Turn on Mobile Hotspot on the phone and connect the laptop to it (recommended for bulletproof local routing).
2. **Find Laptop IPv4:**
   - In Windows PowerShell:
     ```powershell
     ipconfig
     ```
   - Note the `IPv4 Address` (e.g. `192.168.1.15` or `192.168.43.100`).
3. **Optional `.env.local` Update:**
   - In `frontend/.env.local`:
     ```env
     NEXT_PUBLIC_APP_URL=http://<YOUR_LAPTOP_IP>:3000
     NEXT_PUBLIC_API_URL=http://<YOUR_LAPTOP_IP>:8000
     ```
   *(Note: The application has built-in auto-discovery that dynamically matches the phone's browser origin if not explicitly set).*

---

## 🔑 Demo Credentials Cheat Sheet

| Role | Username | Password | Persona & Initial Status |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `STU001` | `student123` | **Aniket Gaikwad** (Room B-204, Block B, Status: `OUTSIDE`) |
| **Demo Warden** | `WARDEN001` | `warden123` | **Dr. Rajesh Sharma** (Chief Warden) |
| **Student 02** | `STU002` | `student123` | Rohan Verma (Room A-101, Block A, Status: `INSIDE`) |

---

## 🛡️ Built-in Demo Fallbacks & Failsafes

| Contingency | Built-in Fallback Safeguard |
| :--- | :--- |
| **Phone Camera Permissions Denied** | The scan and warden scanner pages include a prominent **"Manual Token Fallback"** with 1-click preloaded demo shortcuts. |
| **Strict College Wi-Fi Isolation** | Open two browser tabs side-by-side on the laptop (Student on left, Warden on right). The QR code page has a "Simulate Scan on Laptop" button. |
| **Duplicate Tap On "MARK ENTRY"** | System enforces strict conflict prevention: returns `ALREADY_INSIDE` error dialog preventing corrupted state. |
| **WebSocket Connection Drops** | Automated 4-second polling fallback ensures live dashboards never get stuck. |
| **QR Code Token Expired** | "Refresh Token" button regenerates a fresh cryptographic token in 1 click. |

---

## 🎨 Visual Design Palette
- **Periwinkle (`#9FA8FF`)**: Primary brand highlights, active states, key interactive buttons.
- **Pure Black (`#000000`) & Deep Dark Surfaces (`#0A0A0E`, `#12121A`)**: Sleek, high-contrast, premium aesthetic.
- **Coral Red (`#FF5A5F`)**: OUTSIDE status, urgent complaints, SOS alerts, disciplinary fines.
- **Semantic Status Green (`#10B981`)**: Minimal highlight for verified INSIDE status.
- **White (`#FFFFFF`)**: Bold typography with crisp readability.

---

## 📁 Architectural Documents
Detailed architectural specifications created by the Lead Architect:
- [ARCHITECTURE.md](file:///c:/Users/Aniket19/OneDrive/Desktop/Hostel_main/docs/ARCHITECTURE.md)
- [API_CONTRACT.md](file:///c:/Users/Aniket19/OneDrive/Desktop/Hostel_main/docs/API_CONTRACT.md)
- [DATABASE.md](file:///c:/Users/Aniket19/OneDrive/Desktop/Hostel_main/docs/DATABASE.md)
- [DEMO_FLOW.md](file:///c:/Users/Aniket19/OneDrive/Desktop/Hostel_main/docs/DEMO_FLOW.md)
