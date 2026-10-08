# HOSTELSPHERE Master Demo Flow & Operational Guide
**Tagline:** "One Hostel. One Platform."
**Source of Truth:** Lead Architect (Agent 01) & Demo Experience Engineer (Agent 12)

---

## 1. The Core Demonstration Sequence

The pinnacle moment of the presentation is a live physical scan from any smartphone running on the local network into the local application:

```
[LAPTOP: STUDENT SCREEN]
  1. Student logs in as STU001 / student123.
  2. Student navigates to "MY QR" (/student/qr).
  3. A high-contrast, beautiful QR identity card appears with student name "Aniket Gaikwad", Room "B-204", Block "Block B", and status "OUTSIDE".
         │
         ▼
[PHYSICAL PHONE CAMERA / JUDGE]
  4. Judge points their native phone camera at the screen QR.
  5. The URL detects as: http://<LAPTOP_IP>:3000/scan?token=hs_sec_...
  6. Phone browser opens the local HOSTELSPHERE application.
         │
         ▼
[PHONE / SCAN PREVIEW: /scan]
  7. Screen displays:
     "HOSTELSPHERE — QR DETECTED ✓"
     - Student: Aniket Gaikwad
     - Student ID: STU001
     - Room: B-204
     - Current Status: OUTSIDE (in Coral Red)
     - Security Note: Sensitive profile & operational controls locked.
  8. Judge/Warden taps: "CONTINUE TO WARDEN LOGIN".
         │
         ▼
[WARDEN LOGIN: /login?role=warden&studentToken=...]
  9. Warden enters credentials:
     Username: WARDEN001
     Password: warden123
 10. Click "AUTHORIZE & VERIFY".
         │
         ▼
[STUDENT VERIFICATION & ACTION: /warden/students/s-001?source=qr]
 11. Full student profile loads:
     - Disciplinary & Attendance Standing
     - Pending Complaints & Outstanding Fees
     - Prominent action controls:
       [ MARK ENTRY ]    [ MARK EXIT ]
 12. Warden taps: [ MARK ENTRY ].
 13. System verifies student is currently OUTSIDE, records timestamped ENTRY log with gate and device info, and flips status to INSIDE.
 14. Instant Green Banner: "✓ ENTRY RECORDED FOR ANIKET GAIKWAD".
         │
         ▼
[LAPTOP: WARDEN & STUDENT DASHBOARDS]
 15. The Warden Operations Dashboard updates:
     - INSIDE: 427 ➔ 428
     - OUTSIDE: 73 ➔ 72
     - Live Movement Feed: New entry card appears at the top:
       "Aniket Gaikwad | B-204 | 🟢 INSIDE | Just now"
 16. The Student's personal dashboard flips immediately to:
     - HOSTEL STATUS: 🟢 INSIDE
```

---

## 2. Local Network Setup Instructions

To allow any phone on the same Wi-Fi or hotspot to open the application:

### Step 1: Connect Devices to Same Network
Connect your laptop and your mobile phone to either:
- The same Wi-Fi network, OR
- Turn on Mobile Hotspot on the phone and connect the laptop to it.

### Step 2: Determine Laptop IPv4 Address
In PowerShell / Command Prompt on Windows:
```powershell
ipconfig
```
Look for `IPv4 Address` under your active Wireless adapter (e.g. `192.168.1.15` or `192.168.43.100`).

### Step 3: Configure Environment Variables
In `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://<YOUR_LAPTOP_IP>:8000
NEXT_PUBLIC_APP_URL=http://<YOUR_LAPTOP_IP>:3000
```
*(If testing on the same laptop without phone, `http://localhost:3000` works as default).*

### Step 4: Launch Backend & Frontend
Both servers must bind to `0.0.0.0`:
- **Backend:** `python run_backend.py` (binds to `0.0.0.0:8000`)
- **Frontend:** `npm run dev -- -H 0.0.0.0` (binds to `0.0.0.0:3000`)

### Step 5: Test from Phone
On phone browser, open:
```
http://<YOUR_LAPTOP_IP>:3000
```
The HOSTELSPHERE portal will render cleanly in mobile-optimized mode.

---

## 3. Demo Fallback Scenarios & Safeguards

| Scenario | Risk | Built-in Fallback |
| :--- | :--- | :--- |
| **Phone Camera Incompatible / Permissions Denied** | Judge's phone camera cannot scan or browser denies video feed | Every scanner page includes **"Manual Token Entry"** where entering the 6-character short code or token immediately resolves the student. |
| **Local Wi-Fi Client Isolation (Cannot ping laptop)** | Some strict corporate / college Wi-Fi networks block client-to-client traffic | Open two browser windows side-by-side on the laptop (Student on left, Warden / Scan on right). Alternatively, turn on phone hotspot which always permits client routing. |
| **WebSocket Connection Interrupted** | Anti-virus or firewall interrupts live socket connection | The application features automated fallback polling (every 4 seconds) to ensure status changes always sync within seconds. |
| **QR Code Expired / Invalidated** | Demo paused for long period | "Regenerate QR" button on student screen issues fresh token in 1 click. |
| **Accidental Double Entry** | Warden taps "MARK ENTRY" twice | API prevents duplicate state transition and surfaces clean dialog: "Student is already inside the hostel." |

---

## 4. Demo Credentials Cheat Sheet

| Role | Username | Password | Key Persona |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `STU001` | `student123` | Aniket Gaikwad (Room B-204, Block B) |
| **Demo Warden** | `WARDEN001` | `warden123` | Dr. Rajesh Sharma (Chief Warden) |
| **Secondary Student** | `STU002` | `student123` | Rohan Verma (Room A-101, Block A) |
