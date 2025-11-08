# Quick Test: First-Time Password Change
# This script quickly tests if new users are forced to change password

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Test: First-Time Password Change" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api"

# Test 1: Create a new test user
Write-Host "[1] Creating test user..." -ForegroundColor Yellow

try {
    # Login as admin
    $adminLogin = @{
        loginId = "OIADUS20200001"
        password = "Password123!"
    } | ConvertTo-Json

    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post `
        -ContentType "application/json" -Body $adminLogin

    $adminToken = $adminResponse.token
    Write-Host "  [OK] Logged in as admin" -ForegroundColor Green

    # Create test employee
    $testEmployee = @{
        loginId = "OITEST20250999"
        email = "testuser999@example.com"
        password = "TempPass123!"
        role = "EMPLOYEE"
        firstName = "Test"
        lastName = "User999"
        dateOfJoining = "2025-11-08"
        department = "Testing"
        designation = "Test Engineer"
        phoneNumber = "9999999999"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }

    $createResponse = Invoke-RestMethod -Uri "$baseUrl/employees" -Method Post `
        -Headers $headers -Body $testEmployee

    Write-Host "  [OK] Created test user: OITEST20250999" -ForegroundColor Green
    Write-Host "  [INFO] mustChangePassword in response: $($createResponse.data.user.mustChangePassword)" -ForegroundColor Cyan

    if ($createResponse.data.user.mustChangePassword -eq $true) {
        Write-Host "  [PASS] mustChangePassword is TRUE" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] mustChangePassword should be TRUE but got: $($createResponse.data.user.mustChangePassword)" -ForegroundColor Red
    }

} catch {
    $errorMsg = ""
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorMsg = $errorObj.error
        } catch {
            $errorMsg = $_.Exception.Message
        }
    } else {
        $errorMsg = $_.Exception.Message
    }
    
    if ($errorMsg -match "duplicate|unique|already exists") {
        Write-Host "  [INFO] Test user already exists, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "  [ERROR] Error: $errorMsg" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Login with new user and check the flag
Write-Host ""
Write-Host "[2] Testing login with new user..." -ForegroundColor Yellow

try {
    $testLogin = @{
        loginId = "OITEST20250999"
        password = "TempPass123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post `
        -ContentType "application/json" -Body $testLogin

    Write-Host "  [OK] Login successful" -ForegroundColor Green
    Write-Host "  [INFO] Login response keys: $($loginResponse.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
    Write-Host "  [INFO] User object keys: $($loginResponse.user.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
    Write-Host "  [INFO] mustChangePassword in user object: $($loginResponse.user.mustChangePassword)" -ForegroundColor Cyan

    if ($loginResponse.user.mustChangePassword -eq $true) {
        Write-Host "  [PASS] Login response has mustChangePassword = TRUE" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] mustChangePassword should be TRUE but got: $($loginResponse.user.mustChangePassword)" -ForegroundColor Red
    }

} catch {
    $errorMsg = ""
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorMsg = $errorObj.error
        } catch {
            $errorMsg = $_.Exception.Message
        }
    } else {
        $errorMsg = $_.Exception.Message
    }
    Write-Host "  [ERROR] Login failed: $errorMsg" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Testing Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open browser to: http://localhost:3000/login" -ForegroundColor White
Write-Host ""
Write-Host "2. Login with test credentials:" -ForegroundColor Yellow
Write-Host "   Login ID: OITEST20250999" -ForegroundColor Cyan
Write-Host "   Password: TempPass123!" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Expected behavior:" -ForegroundColor Yellow
Write-Host "   [OK] Should redirect to: /change-password-first-time" -ForegroundColor Green
Write-Host "   [OK] Should see password change page" -ForegroundColor Green
Write-Host "   [OK] Should NOT be able to access dashboard" -ForegroundColor Green
Write-Host ""
Write-Host "4. Check browser console (F12) for debug logs:" -ForegroundColor Yellow
Write-Host "   - Look for [DEBUG] messages showing mustChangePassword flag" -ForegroundColor White
Write-Host "   - Should see [KEY] redirect message" -ForegroundColor White
Write-Host ""
Write-Host "5. Change password on the page and verify:" -ForegroundColor Yellow
Write-Host "   - After success, should redirect to dashboard" -ForegroundColor White
Write-Host "   - Next login should go directly to dashboard" -ForegroundColor White
Write-Host ""
