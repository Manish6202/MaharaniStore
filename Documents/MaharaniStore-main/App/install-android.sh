#!/bin/bash

# Android Phone में App Install करने का Script
# Usage: ./install-android.sh

echo "🚀 Android App Installation Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the App directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if device is connected
echo "📱 Checking for connected Android device..."
adb devices

DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device" | wc -l | tr -d ' ')

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo ""
    echo "⚠️  No Android device found!"
    echo ""
    echo "Please make sure:"
    echo "1. Phone में USB Debugging ON है"
    echo "2. Phone USB cable से connected है"
    echo "3. Phone में 'Allow USB debugging' permission दिया है"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to cancel..."
else
    echo "✅ Device connected!"
    echo ""
fi

# Build and install
echo "🔨 Building and installing app..."
echo ""

npm run android

echo ""
echo "✅ Done! App should be installed on your phone now."
echo ""

