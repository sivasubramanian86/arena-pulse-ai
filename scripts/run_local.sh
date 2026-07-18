#!/bin/bash
# Script to launch ArenaPulseAI locally (Bash/Git-Bash)

echo "Checking for active processes on ports 3000 and 8000..."
for port in 3000 8000; do
  pid=$(lsof -t -i:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)..."
    kill -9 $pid 2>/dev/null
  fi
done

sleep 1

echo "Launching FastAPI backend..."
(cd backend && .venv/Scripts/python -m uvicorn app.main:app --port 8000 --reload) &

echo "Launching Next.js frontend..."
(cd frontend && npm run dev) &

echo -e "\nAll processes spawned successfully in background."
echo "  - Backend API:       http://localhost:8000"
echo "  - Frontend Client:   http://localhost:3000"
