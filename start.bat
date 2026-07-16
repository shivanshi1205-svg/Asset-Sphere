@echo off
echo ===================================================
echo Starting AssetSphere Full-Stack IT Asset Management
echo ===================================================
echo.
echo [1/2] Launching Express Backend Server...
start cmd /k "cd express-backend && npm start"

echo [2/2] Launching React Frontend Dev Server...
start cmd /k "cd react-frontend && npm run dev"
echo.
echo Servers launched successfully in new windows.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo.
pause
