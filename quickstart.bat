@echo off
REM ============ XPLR HPG2 Location Tracker - Quick Start (Windows) ============

echo.
echo 🚀 XPLR HPG2 Location Tracker - Quick Start Setup
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14 or higher.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

echo ✅ npm version:
npm --version
echo.

REM Navigate to frontend directory
echo 📂 Setting up frontend...
cd frontend

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.
echo 🎨 Your enhanced UI is ready with:
echo    • Glassmorphism design with backdrop blur
echo    • Modern animated gradient backgrounds
echo    • Interactive glassmorphic cards
echo    • XPLR HPG2 device integration
echo    • Real-time location tracking
echo.
echo 🚀 Starting development server...
echo    The app will open at: http://localhost:3000
echo.
echo 📱 Features:
echo    • Toggle between Geolocation and XPLR HPG2
echo    • Real-time speed and distance tracking
echo    • Interactive map with custom markers
echo    • Live speed graph
echo    • Glassmorphic UI with smooth animations
echo.
echo 🛰️  For XPLR HPG2:
echo    1. Connect your u-blox XPLR device via USB
echo    2. Click '🛰️ XPLR HPG2' in the app
echo    3. Select your device from the browser dialog
echo    4. Location data will stream in real-time
echo.
echo Press any key to start the development server...
pause

call npm start
