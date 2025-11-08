# WorkZen HRMS - Phase A.1 Verification Tests
# Run these commands to verify the setup

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   WorkZen HRMS - Phase A.1 Tests" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check Endpoint" -ForegroundColor Yellow
Write-Host "GET http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host ""

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue
if ($response.status -eq "OK") {
    Write-Host "✅ PASSED: Health check returned OK" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} else {
    Write-Host "❌ FAILED: Health check failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "-------------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 2: Root Endpoint
Write-Host "Test 2: Root Endpoint" -ForegroundColor Yellow
Write-Host "GET http://localhost:5000/" -ForegroundColor Gray
Write-Host ""

$response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get -ErrorAction SilentlyContinue
if ($response.message) {
    Write-Host "✅ PASSED: Root endpoint returned welcome message" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} else {
    Write-Host "❌ FAILED: Root endpoint failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "-------------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 3: 404 Handler
Write-Host "Test 3: 404 Handler" -ForegroundColor Yellow
Write-Host "GET http://localhost:5000/api/nonexistent" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/nonexistent" -Method Get -ErrorAction Stop
    Write-Host "❌ FAILED: Should have returned 404" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 404) {
        Write-Host "✅ PASSED: 404 handler working correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: Expected 404, got $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Phase A.1 Tests Complete" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
