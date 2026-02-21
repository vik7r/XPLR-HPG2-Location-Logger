#!/bin/bash

# ============ XPLR HPG2 Location Tracker - Quick Start Guide ============

echo "🚀 XPLR HPG2 Location Tracker - Quick Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to frontend directory
echo "📂 Setting up frontend..."
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎨 Your enhanced UI is ready with:"
    echo "   • Glassmorphism design with backdrop blur"
    echo "   • Modern animated gradient backgrounds"
    echo "   • Interactive glassmorphic cards"
    echo "   • XPLR HPG2 device integration"
    echo "   • Real-time location tracking"
    echo ""
    echo "🚀 Starting development server..."
    echo "   The app will open at: http://localhost:3000"
    echo ""
    echo "📱 Features:"
    echo "   • Toggle between Geolocation and XPLR HPG2"
    echo "   • Real-time speed and distance tracking"
    echo "   • Interactive map with custom markers"
    echo "   • Live speed graph"
    echo "   • Glassmorphic UI with smooth animations"
    echo ""
    echo "🛰️  For XPLR HPG2:"
    echo "   1. Connect your u-blox XPLR device via USB"
    echo "   2. Click '🛰️ XPLR HPG2' in the app"
    echo "   3. Select your device from the browser dialog"
    echo "   4. Location data will stream in real-time"
    echo ""
    npm start
else
    echo "❌ Failed to install dependencies. Please try again."
    exit 1
fi
