#!/bin/bash
echo "========================================================================="
echo "                  HOSTELSPHERE - 'One Hostel. One Platform.'"
echo "                    DEMO LAUNCHER & LOCAL NETWORK SETUP"
echo "========================================================================="

LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "[INFO] Detected Local IP Address: $LOCAL_IP"
echo "[INFO] Phone URL on same Wi-Fi: http://$LOCAL_IP:3000"

(cd backend && python run_backend.py) &
BACKEND_PID=$!

sleep 3

(cd frontend && npm run dev -- -H 0.0.0.0) &
FRONTEND_PID=$!

echo "[SUCCESS] Services running. Press Ctrl+C to terminate."
wait $BACKEND_PID $FRONTEND_PID
