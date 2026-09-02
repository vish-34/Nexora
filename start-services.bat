@echo off
setlocal

cd /d "%~dp0phase-3"
start "CoolNeighbour Phase 3 (FastAPI AI Engine :8000)" cmd /k ".\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

cd /d "%~dp0phase-2"
start "CoolNeighbour Phase 2 (MERN Core Backend :5000)" cmd /k "node src/server.js"

echo Services launched:
echo   Phase 3 AI Engine: http://localhost:8000
echo   Phase 2 Core Backend: http://localhost:5000
