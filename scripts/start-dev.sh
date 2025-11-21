#!/bin/bash

# Script to start the development environment

echo "======================================"
echo "Buddy - Development Environment"
echo "======================================"
echo ""

# Check if Ollama is running
echo "🔍 Checking Ollama..."
if curl -s http://localhost:11434 > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not running!"
    echo "   Please start Ollama first."
    exit 1
fi

echo ""
echo "🚀 Starting backend server..."
echo ""

cd backend
npm run dev

