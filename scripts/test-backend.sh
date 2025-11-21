#!/bin/bash

# Script to test the backend server

echo "======================================"
echo "Buddy - Backend Test Script"
echo "======================================"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend is not running!"
    echo ""
    echo "Please start the backend first:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "======================================"
echo "Test 1: Health Check"
echo "======================================"
echo ""

HEALTH=$(curl -s http://localhost:3000/health)
echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"

echo ""
echo "======================================"
echo "Test 2: Ollama Connection"
echo "======================================"
echo ""

TEST=$(curl -s http://localhost:3000/api/test)
echo "$TEST" | jq '.' 2>/dev/null || echo "$TEST"

# Check if test was successful
if echo "$TEST" | grep -q '"success":true'; then
    echo ""
    echo "✅ Ollama connection successful!"
else
    echo ""
    echo "⚠️  Ollama connection failed."
    echo "   Make sure Ollama is installed and running."
    echo "   Visit: https://ollama.ai"
fi

echo ""
echo "======================================"
echo "Test 3: Chat Endpoint"
echo "======================================"
echo ""

CHAT=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Say hello in one sentence"}')

echo "$CHAT" | jq '.' 2>/dev/null || echo "$CHAT"

echo ""
echo "======================================"
echo "Test Complete!"
echo "======================================"
echo ""

# Summary
if echo "$TEST" | grep -q '"success":true' && echo "$CHAT" | grep -q '"success":true'; then
    echo "✅ All tests passed!"
    echo ""
    echo "Phase 1 is complete and working!"
    echo "You can now proceed to Phase 2."
else
    echo "⚠️  Some tests failed."
    echo ""
    echo "Common issues:"
    echo "  1. Ollama not installed - Visit https://ollama.ai"
    echo "  2. Ollama not running - Check menu bar for Ollama icon"
    echo "  3. Model not downloaded - Run: ollama pull llama3.2"
    echo ""
    echo "See docs/PHASE1-COMPLETE.md for troubleshooting"
fi

echo ""

