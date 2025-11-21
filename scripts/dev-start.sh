#!/bin/bash
# 🌙 Noctaliæ - Dev Start Script
# Cross-platform alternative to GO.bat

echo "🌙 Starting Noctaliæ..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Expo
echo "🚀 Launching Expo..."
npx expo start

