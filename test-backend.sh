#!/bin/bash

echo "================================"
echo "🧪 BUDDY BACKEND TESTING SUITE"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Health Check
echo "📝 Test 1: Health Check"
echo "------------------------"
curl -s "$BASE_URL/health"
echo -e "\n"

# Test 2: Database Stats
echo "📝 Test 2: Database Stats"
echo "------------------------"
curl -s "$BASE_URL/api/data/stats"
echo -e "\n\n"

# Test 3: Extract Email
echo "📝 Test 3: Extract Email"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is my email?"}'
echo -e "\n\n"

# Test 4: Extract Phone
echo "📝 Test 4: Extract Phone"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is my phone number?"}'
echo -e "\n\n"

# Test 5: Extract Name
echo "📝 Test 5: Extract Name"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is my full name?"}'
echo -e "\n\n"

# Test 6: Skills Question
echo "📝 Test 6: Skills Question (Paragraph)"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my Node.js skills?"}'
echo -e "\n\n"

# Test 7: Skills List (Bullets)
echo "📝 Test 7: Skills List (Bullets)"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "List my programming languages", "format": "bullets"}'
echo -e "\n\n"

# Test 8: Work Experience
echo "📝 Test 8: Work Experience"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about my work experience"}'
echo -e "\n\n"

# Test 9: Job Preferences
echo "📝 Test 9: Job Preferences"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "What kind of job am I looking for?"}'
echo -e "\n\n"

# Test 10: Quick Extract Helper
echo "📝 Test 10: Quick Extract Helper"
echo "------------------------"
curl -s -X POST "$BASE_URL/api/rag/extract" \
  -H "Content-Type: application/json" \
  -d '{"fieldType": "email"}'
echo -e "\n\n"

echo "================================"
echo "✅ ALL TESTS COMPLETE"
echo "================================"
