@echo off
echo 🌲 Starting Bandipur Watch Nexus Development Environment...
echo.

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 🚀 Starting development servers...
echo.

echo Starting Backend (Terminal 1)...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Terminal 2)...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Development servers started!
echo    Frontend: http://localhost:8080
echo    Backend:  http://localhost:4000
echo.
echo Press any key to run setup test...
pause >nul

node test-setup.js

echo.
echo Press any key to exit...
pause >nul

