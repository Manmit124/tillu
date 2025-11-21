#!/bin/bash

# Script to test Phase 2: Data Storage & RAG

echo "======================================"
echo "Buddy - Phase 2 Test Script"
echo "======================================"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Backend is not running!"
    echo ""
    echo "Please start the backend first:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "✅ Backend is running!"
echo ""

echo "======================================"
echo "Test 1: Ingest Personal Data"
echo "======================================"
echo ""

INGEST=$(curl -s -X POST http://localhost:3000/api/data/ingest)
echo "$INGEST" | jq '.' 2>/dev/null || echo "$INGEST"

echo ""
echo "======================================"
echo "Test 2: Get Database Stats"
echo "======================================"
echo ""

STATS=$(curl -s http://localhost:3000/api/data/stats)
echo "$STATS" | jq '.' 2>/dev/null || echo "$STATS"

echo ""
echo "======================================"
echo "Test 3: Search Documents"
echo "======================================"
echo ""

SEARCH=$(curl -s -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my skills?", "limit": 3}')

echo "$SEARCH" | jq '.' 2>/dev/null || echo "$SEARCH"

echo ""
echo "======================================"
echo "Test 4: Answer Personal Question"
echo "======================================"
echo ""

QUESTION=$(curl -s -X POST http://localhost:3000/api/rag/question \
  -H "Content-Type: application/json" \
  -d '{"question": "What is my name?"}')

echo "$QUESTION" | jq '.' 2>/dev/null || echo "$QUESTION"

echo ""
echo "======================================"
echo "Test 5: RAG Chat"
echo "======================================"
echo ""

CHAT=$(curl -s -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are my Node.js skills and experience?"}')

echo "$CHAT" | jq '.response' 2>/dev/null || echo "$CHAT"

echo ""
echo "======================================"
echo "Test 6: Form Fill Data"
echo "======================================"
echo ""

FORM=$(curl -s -X POST http://localhost:3000/api/rag/form-fill \
  -H "Content-Type: application/json" \
  -d '{"fieldType": "email"}')

echo "$FORM" | jq '.' 2>/dev/null || echo "$FORM"

echo ""
echo "======================================"
echo "Test Complete!"
echo "======================================"
echo ""

# Check if all tests passed
if echo "$INGEST" | grep -q '"success":true' && \
   echo "$STATS" | grep -q '"success":true' && \
   echo "$SEARCH" | grep -q '"success":true' && \
   echo "$QUESTION" | grep -q '"success":true' && \
   echo "$CHAT" | grep -q '"success":true' && \
   echo "$FORM" | grep -q '"success":true'; then
    echo "✅ All Phase 2 tests passed!"
    echo ""
    echo "Phase 2 is complete and working!"
    echo "You can now proceed to Phase 3: Chrome Extension"
else
    echo "⚠️  Some tests failed."
    echo ""
    echo "Common issues:"
    echo "  1. Data files not updated - Edit data/personal/*.json"
    echo "  2. ChromaDB error - Check logs in backend terminal"
    echo "  3. Ollama not responding - Restart Ollama"
    echo ""
    echo "See docs/PHASE2-COMPLETE.md for troubleshooting"
fi

echo ""

