@echo off
echo Starting LearnSphere (Fixed Paths)...

:: Start Backend (We are already in LearnSphere_Final, just go to backend)
start "Backend Server" cmd /k "cd backend && python app.py"

echo Backend launching... waiting 5 seconds...
timeout /t 5

:: Start Frontend (We are already in LearnSphere_Final, just go to frontend)
start "Frontend Client" cmd /k "cd frontend && npm run dev"

echo SYSTEM LAUNCHED. Refresh your browser at http://localhost:3000
