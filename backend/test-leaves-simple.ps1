# Simple Leave API Testing Script
# WorkZen HRMS - Leave Management APIs

$baseUrl = "http://localhost:5000/api"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "LEAVE API TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login as Employee
Write-Host "[TEST 1] Login as Employee..." -ForegroundColor Yellow
$loginBody = @{
    loginId = "OIALSM20210002"
    password = "Password123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $employeeToken = $loginResponse.data.token
    $employeeId = $loginResponse.data.user.employeeId
    Write-Host "  ✓ PASS - Employee Token obtained" -ForegroundColor Green
    Write-Host "  Employee ID: $employeeId" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Login as HR
Write-Host "`n[TEST 2] Login as HR Officer..." -ForegroundColor Yellow
$hrLoginBody = @{
    loginId = "OIHERO20200002"
    password = "Password123!"
} | ConvertTo-Json

try {
    $hrLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $hrLoginBody -ContentType "application/json"
    $hrToken = $hrLoginResponse.data.token
    Write-Host "  ✓ PASS - HR Token obtained" -ForegroundColor Green
} catch {
    Write-Host "  ✗ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Apply for leave
Write-Host "`n[TEST 3] Apply for SICK leave (2 days)..." -ForegroundColor Yellow
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$dayAfterTomorrow = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")

$leaveBody = @{
    leaveType = "SICK"
    startDate = $tomorrow
    endDate = $dayAfterTomorrow
    reason = "Feeling unwell need rest"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
        "Content-Type" = "application/json"
    }
    $leaveResponse = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method POST -Headers $headers -Body $leaveBody
    $leaveId = $leaveResponse.data.id
    Write-Host "  ✓ PASS - Leave application submitted" -ForegroundColor Green
    Write-Host "  Leave ID: $leaveId" -ForegroundColor Gray
    Write-Host "  Status: $($leaveResponse.data.status)" -ForegroundColor Gray
    Write-Host "  Total Days: $($leaveResponse.data.totalDays)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ FAIL - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 4: List own leaves
Write-Host "`n[TEST 4] Employee lists own leaves..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
    }
    $leavesResponse = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method GET -Headers $headers
    Write-Host "  ✓ PASS - Leaves retrieved" -ForegroundColor Green
    Write-Host "  Total Leaves: $($leavesResponse.pagination.total)" -ForegroundColor Gray
    Write-Host "  Current Page Leaves: $($leavesResponse.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ FAIL - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 5: Check leave balance
Write-Host "`n[TEST 5] Check leave balance..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
    }
    $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/leaves/balance/$employeeId" -Method GET -Headers $headers
    Write-Host "  ✓ PASS - Balance retrieved" -ForegroundColor Green
    Write-Host "  Year: $($balanceResponse.year)" -ForegroundColor Gray
    Write-Host "  SICK Leave - Remaining: $($balanceResponse.balance.SICK.remaining)" -ForegroundColor Gray
    Write-Host "  CASUAL Leave - Remaining: $($balanceResponse.balance.CASUAL.remaining)" -ForegroundColor Gray
    Write-Host "  PAID Leave - Remaining: $($balanceResponse.balance.PAID.remaining)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ FAIL - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 6: Get specific leave details
if ($leaveId) {
    Write-Host "`n[TEST 6] Get specific leave details..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $employeeToken"
        }
        $leaveDetailsResponse = Invoke-RestMethod -Uri "$baseUrl/leaves/$leaveId" -Method GET -Headers $headers
        Write-Host "  ✓ PASS - Leave details retrieved" -ForegroundColor Green
        Write-Host "  Leave Type: $($leaveDetailsResponse.data.leaveType)" -ForegroundColor Gray
        Write-Host "  Status: $($leaveDetailsResponse.data.status)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ FAIL - $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 7: HR approves leave
if ($leaveId) {
    Write-Host "`n[TEST 7] HR approves leave..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $hrToken"
        }
        $approveResponse = Invoke-RestMethod -Uri "$baseUrl/leaves/$leaveId/approve" -Method PUT -Headers $headers
        Write-Host "  ✓ PASS - Leave approved" -ForegroundColor Green
        Write-Host "  Status: $($approveResponse.data.status)" -ForegroundColor Gray
        Write-Host "  Attendance Records Created: $($approveResponse.attendanceRecordsCreated)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ FAIL - $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 8: Apply for half-day leave
Write-Host "`n[TEST 8] Apply for half-day CASUAL leave..." -ForegroundColor Yellow
$nextWeek = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")

$halfDayBody = @{
    leaveType = "CASUAL"
    startDate = $nextWeek
    endDate = $nextWeek
    reason = "Personal appointment"
    isHalfDay = $true
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
        "Content-Type" = "application/json"
    }
    $halfDayResponse = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method POST -Headers $headers -Body $halfDayBody
    Write-Host "  ✓ PASS - Half-day leave submitted" -ForegroundColor Green
    Write-Host "  Total Days: $($halfDayResponse.data.totalDays) (should be 0.5)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ FAIL - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 9: Try overlapping leave (should fail)
Write-Host "`n[TEST 9] Try to apply overlapping leave (should fail)..." -ForegroundColor Yellow
$overlapBody = @{
    leaveType = "PAID"
    startDate = $tomorrow
    endDate = $dayAfterTomorrow
    reason = "This should fail"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
        "Content-Type" = "application/json"
    }
    $overlapResponse = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method POST -Headers $headers -Body $overlapBody
    Write-Host "  ✗ FAIL - Should have been rejected (overlapping dates)" -ForegroundColor Red
} catch {
    Write-Host "  ✓ PASS - Correctly rejected overlapping leave" -ForegroundColor Green
    Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
}

# Test 10: HR views all leaves
Write-Host "`n[TEST 10] HR views all leaves..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $hrToken"
    }
    $allLeavesResponse = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method GET -Headers $headers
    Write-Host "  ✓ PASS - All leaves retrieved" -ForegroundColor Green
    Write-Host "  Total Leaves (All Employees): $($allLeavesResponse.pagination.total)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ FAIL - $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ LEAVE API TESTING COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
