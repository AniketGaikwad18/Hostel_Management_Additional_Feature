@echo off
title HOSTELSPHERE - Unified University Hostel Management System
color 0B

echo =========================================================================
echo                   HOSTELSPHERE - "One Hostel. One Platform."
echo                     DEMO LAUNCHER ^& LOCAL NETWORK SETUP
echo =========================================================================
echo.

:: Detect IPv4 address
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set LOCAL_IP=%%a
)

echo [INFO] Detected Local Network IPv4 Address: %LOCAL_IP%
echo [INFO] Connect phone and laptop to same Wi-Fi or Mobile Hotspot.
echo [INFO] Phone will scan QR and open: http://%LOCAL_IP%:3000/scan
echo.

echo Starting FastAPI Backend (0.0.0.0:8000)...
start "HOSTELSPHERE Backend (FastAPI)" cmd /k "cd backend && python run_backend.py"

timeout /t 3 >nul

echo Starting Next.js Frontend (0.0.0.0:3000)...
start "HOSTELSPHERE Frontend (Next.js)" cmd /k "cd frontend && npm run dev -- -H 0.0.0.0"

echo.
echo =========================================================================
echo [SUCCESS] Both servers are launching!
echo.
echo   Student Portal (Laptop):       http://localhost:3000
echo   Warden Operations:             http://localhost:3000/warden/dashboard
echo   Phone Access (Same Network):   http://%LOCAL_IP%:3000
echo   FastAPI Swagger Docs:          http://localhost:8000/docs
echo =========================================================================
echo.
pause
