#!/bin/bash
# WorkZen HRMS - Phase A.1 Verification Tests (Bash version)
# Run these commands to verify the setup

echo "==========================================="
echo "   WorkZen HRMS - Phase A.1 Tests"
echo "==========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check Endpoint"
echo "GET http://localhost:5000/api/health"
echo ""

response=$(curl -s http://localhost:5000/api/health)
if echo "$response" | grep -q '"status":"OK"'; then
    echo "✅ PASSED: Health check returned OK"
    echo "   Response: $response"
else
    echo "❌ FAILED: Health check failed"
fi

echo ""
echo "-------------------------------------------"
echo ""

# Test 2: Root Endpoint
echo "Test 2: Root Endpoint"
echo "GET http://localhost:5000/"
echo ""

response=$(curl -s http://localhost:5000/)
if echo "$response" | grep -q '"message"'; then
    echo "✅ PASSED: Root endpoint returned welcome message"
    echo "   Response: $response"
else
    echo "❌ FAILED: Root endpoint failed"
fi

echo ""
echo "-------------------------------------------"
echo ""

# Test 3: 404 Handler
echo "Test 3: 404 Handler"
echo "GET http://localhost:5000/api/nonexistent"
echo ""

status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/nonexistent)
if [ "$status_code" -eq 404 ]; then
    echo "✅ PASSED: 404 handler working correctly"
else
    echo "❌ FAILED: Expected 404, got $status_code"
fi

echo ""
echo "==========================================="
echo "   Phase A.1 Tests Complete"
echo "==========================================="
