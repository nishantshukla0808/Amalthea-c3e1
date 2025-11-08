# Comprehensive Leave API Testing Script
# WorkZen HRMS - Leave Management APIs
# Tests all 7 leave endpoints with various scenarios

$baseUrl = "http://localhost:5000/api"
$employeeToken = ""
$hrToken = ""
$adminToken = ""
$employeeId = ""
$hrEmployeeId = ""
$leaveId = ""

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "LEAVE API COMPREHENSIVE TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test counters
$testsPassed = 0
$testsFailed = 0

# Helper function to make API calls
function Invoke-ApiTest {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [string]$Token,
        [object]$Body = $null
    )
    
    Write-Host "[TEST] $TestName" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✓ PASS" -ForegroundColor Green
        $script:testsPassed++
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.ErrorDetails.Message
        
        if ($statusCode) {
            Write-Host "  ✗ FAIL - Status: $statusCode" -ForegroundColor Red
            Write-Host "  Error: $errorMessage" -ForegroundColor Red
        } else {
            Write-Host "  ✗ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        }
        $script:testsFailed++
        return $null
    }
}

# ============================================
# AUTHENTICATION SETUP
# ============================================

Write-Host "`n--- AUTHENTICATION SETUP ---`n" -ForegroundColor Cyan

# Test 1: Login as Employee (Alice Smith)
$loginResponse = Invoke-ApiTest `
    -TestName "Login as Employee (Alice Smith)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        loginId = "OIALSM20210002"
        password = "Password123!"
    }

if ($loginResponse) {
    $employeeToken = $loginResponse.data.token
    $employeeId = $loginResponse.data.user.employeeId
    Write-Host "  Employee Token: $($employeeToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  Employee ID: $employeeId" -ForegroundColor Gray
}

# Test 2: Login as HR Officer
$loginResponse = Invoke-ApiTest `
    -TestName "Login as HR Officer" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        loginId = "OIHERO20200002"
        password = "Password123!"
    }

if ($loginResponse) {
    $hrToken = $loginResponse.data.token
    $hrEmployeeId = $loginResponse.data.user.employeeId
    Write-Host "  HR Token: $($hrToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  HR Employee ID: $hrEmployeeId" -ForegroundColor Gray
}

# Test 3: Login as Admin
$loginResponse = Invoke-ApiTest `
    -TestName "Login as Admin" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        loginId = "OIADUS20200001"
        password = "NewPassword123!"
    }

if ($loginResponse) {
    $adminToken = $loginResponse.data.token
    Write-Host "  Admin Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Gray
}

if (-not $employeeToken -or -not $hrToken -or -not $adminToken) {
    Write-Host "`n❌ Authentication failed! Cannot proceed with tests." -ForegroundColor Red
    exit 1
}

# ============================================
# TEST LEAVE APPLICATION
# ============================================

Write-Host "`n--- TEST LEAVE APPLICATION ---`n" -ForegroundColor Cyan

# Test 4: Apply for SICK leave (Employee)
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$dayAfterTomorrow = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")

$leaveResponse = Invoke-ApiTest `
    -TestName "Apply for SICK leave 2 days" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "SICK"
        startDate = $tomorrow
        endDate = $dayAfterTomorrow
        reason = "Feeling unwell, need rest"
    }

if ($leaveResponse) {
    $leaveId = $leaveResponse.data.id
    Write-Host "  Leave ID: $leaveId" -ForegroundColor Gray
    Write-Host "  Status: $($leaveResponse.data.status)" -ForegroundColor Gray
    Write-Host "  Total Days: $($leaveResponse.data.totalDays)" -ForegroundColor Gray
}

# Test 5: Apply for half-day CASUAL leave
$nextWeek = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")

$halfDayResponse = Invoke-ApiTest `
    -TestName "Apply for half-day CASUAL leave" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "CASUAL"
        startDate = $nextWeek
        endDate = $nextWeek
        reason = "Personal appointment in the morning"
        isHalfDay = $true
    }

if ($halfDayResponse) {
    Write-Host "  Total Days: $($halfDayResponse.data.totalDays) (should be 0.5)" -ForegroundColor Gray
}

# Test 6: Try to apply for overlapping leave (should fail)
Invoke-ApiTest `
    -TestName "Apply for overlapping leave (should fail)" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "PAID"
        startDate = $tomorrow
        endDate = $dayAfterTomorrow
        reason = "This should fail - overlapping dates"
    }

# Test 7: Apply for leave without required fields (should fail)
Invoke-ApiTest `
    -TestName "Apply for leave without reason (should fail)" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "SICK"
        startDate = $tomorrow
        endDate = $dayAfterTomorrow
    }

# ============================================
# TEST LEAVE LISTING
# ============================================

Write-Host "`n--- TEST LEAVE LISTING ---`n" -ForegroundColor Cyan

# Test 8: Employee views own leaves
$employeeLeavesResponse = Invoke-ApiTest `
    -TestName "Employee views own leaves" `
    -Method "GET" `
    -Endpoint '/leaves?page=1&limit=10' `
    -Token $employeeToken

if ($employeeLeavesResponse) {
    Write-Host "  Total Leaves: $($employeeLeavesResponse.pagination.total)" -ForegroundColor Gray
    Write-Host "  Leaves on this page: $($employeeLeavesResponse.data.Count)" -ForegroundColor Gray
}

# Test 9: HR views all leaves
$hrLeavesResponse = Invoke-ApiTest `
    -TestName "HR views all leaves" `
    -Method "GET" `
    -Endpoint '/leaves?page=1&limit=20' `
    -Token $hrToken

if ($hrLeavesResponse) {
    Write-Host "  Total Leaves (All): $($hrLeavesResponse.pagination.total)" -ForegroundColor Gray
}

# Test 10: Filter leaves by status (PENDING)
$pendingLeavesResponse = Invoke-ApiTest `
    -TestName "Filter leaves by status (PENDING)" `
    -Method "GET" `
    -Endpoint "/leaves?status=PENDING" `
    -Token $hrToken

if ($pendingLeavesResponse) {
    Write-Host "  Pending Leaves: $($pendingLeavesResponse.data.Count)" -ForegroundColor Gray
}

# Test 11: Filter leaves by leave type (SICK)
$sickLeavesResponse = Invoke-ApiTest `
    -TestName "Filter leaves by type (SICK)" `
    -Method "GET" `
    -Endpoint "/leaves?leaveType=SICK" `
    -Token $hrToken

if ($sickLeavesResponse) {
    Write-Host "  SICK Leaves: $($sickLeavesResponse.data.Count)" -ForegroundColor Gray
}

# Test 12: Filter leaves by employee ID
if ($employeeId) {
    $employeeFilterResponse = Invoke-ApiTest `
        -TestName "Filter leaves by employee ID" `
        -Method "GET" `
        -Endpoint "/leaves?employeeId=$employeeId" `
        -Token $hrToken
    
    if ($employeeFilterResponse) {
        Write-Host "  Leaves for Employee: $($employeeFilterResponse.data.Count)" -ForegroundColor Gray
    }
}

# ============================================
# TEST LEAVE BALANCE
# ============================================

Write-Host "`n--- TEST LEAVE BALANCE ---`n" -ForegroundColor Cyan

# Test 13: Employee checks own leave balance
if ($employeeId) {
    $balanceResponse = Invoke-ApiTest `
        -TestName "Employee checks own leave balance" `
        -Method "GET" `
        -Endpoint "/leaves/balance/$employeeId" `
        -Token $employeeToken
    
    if ($balanceResponse) {
        Write-Host "  Year: $($balanceResponse.year)" -ForegroundColor Gray
        Write-Host "  SICK Leave - Used: $($balanceResponse.balance.SICK.used), Remaining: $($balanceResponse.balance.SICK.remaining)" -ForegroundColor Gray
        Write-Host "  CASUAL Leave - Used: $($balanceResponse.balance.CASUAL.used), Remaining: $($balanceResponse.balance.CASUAL.remaining)" -ForegroundColor Gray
        Write-Host "  PAID Leave - Used: $($balanceResponse.balance.PAID.used), Remaining: $($balanceResponse.balance.PAID.remaining)" -ForegroundColor Gray
    }
}

# Test 14: HR checks another employee's balance
if ($hrEmployeeId) {
    $hrBalanceResponse = Invoke-ApiTest `
        -TestName "HR checks another employee's balance" `
        -Method "GET" `
        -Endpoint "/leaves/balance/$hrEmployeeId" `
        -Token $hrToken
    
    if ($hrBalanceResponse) {
        Write-Host "  Employee: $($hrBalanceResponse.employee.firstName) $($hrBalanceResponse.employee.lastName)" -ForegroundColor Gray
    }
}

# Test 15: Employee tries to check another employee's balance (should fail)
if ($hrEmployeeId) {
    Invoke-ApiTest `
        -TestName "Employee tries to check another's balance (should fail)" `
        -Method "GET" `
        -Endpoint "/leaves/balance/$hrEmployeeId" `
        -Token $employeeToken
}

# ============================================
# TEST LEAVE DETAILS
# ============================================

Write-Host "`n--- TEST LEAVE DETAILS ---`n" -ForegroundColor Cyan

# Test 16: Get specific leave details
if ($leaveId) {
    $leaveDetailsResponse = Invoke-ApiTest `
        -TestName "Get specific leave details" `
        -Method "GET" `
        -Endpoint "/leaves/$leaveId" `
        -Token $employeeToken
    
    if ($leaveDetailsResponse) {
        Write-Host "  Leave Type: $($leaveDetailsResponse.data.leaveType)" -ForegroundColor Gray
        Write-Host "  Status: $($leaveDetailsResponse.data.status)" -ForegroundColor Gray
        Write-Host "  Reason: $($leaveDetailsResponse.data.reason)" -ForegroundColor Gray
    }
}

# ============================================
# TEST LEAVE APPROVAL/REJECTION
# ============================================

Write-Host "`n--- TEST LEAVE APPROVAL/REJECTION ---`n" -ForegroundColor Cyan

# Test 17: Employee tries to approve own leave (should fail)
if ($leaveId) {
    Invoke-ApiTest `
        -TestName "Employee tries to approve own leave (should fail)" `
        -Method "PUT" `
        -Endpoint "/leaves/$leaveId/approve" `
        -Token $employeeToken
}

# Test 18: HR approves leave
if ($leaveId) {
    $approveResponse = Invoke-ApiTest `
        -TestName "HR approves leave" `
        -Method "PUT" `
        -Endpoint "/leaves/$leaveId/approve" `
        -Token $hrToken
    
    if ($approveResponse) {
        Write-Host "  Status: $($approveResponse.data.status)" -ForegroundColor Gray
        Write-Host "  Approved By: $($approveResponse.data.approvedBy)" -ForegroundColor Gray
        Write-Host "  Attendance Records Created: $($approveResponse.attendanceRecordsCreated)" -ForegroundColor Gray
    }
}

# Test 19: Try to approve already approved leave (should fail)
if ($leaveId) {
    Invoke-ApiTest `
        -TestName "Try to approve already approved leave (should fail)" `
        -Method "PUT" `
        -Endpoint "/leaves/$leaveId/approve" `
        -Token $hrToken
}

# Create a new leave for rejection test
$futureDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
$futureEndDate = (Get-Date).AddDays(15).ToString("yyyy-MM-dd")

$rejectTestLeave = Invoke-ApiTest `
    -TestName "Create leave for rejection test" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "CASUAL"
        startDate = $futureDate
        endDate = $futureEndDate
        reason = "Testing rejection workflow"
    }

if ($rejectTestLeave) {
    $rejectLeaveId = $rejectTestLeave.data.id
    
    # Test 20: HR rejects leave
    $rejectResponse = Invoke-ApiTest `
        -TestName "HR rejects leave" `
        -Method "PUT" `
        -Endpoint "/leaves/$rejectLeaveId/reject" `
        -Token $hrToken
    
    if ($rejectResponse) {
        Write-Host "  Status: $($rejectResponse.data.status)" -ForegroundColor Gray
        Write-Host "  Rejected By: $($rejectResponse.data.rejectedBy)" -ForegroundColor Gray
    }
}

# ============================================
# TEST LEAVE CANCELLATION
# ============================================

Write-Host "`n--- TEST LEAVE CANCELLATION ---`n" -ForegroundColor Cyan

# Create a new leave for cancellation test
$cancelDate = (Get-Date).AddDays(21).ToString("yyyy-MM-dd")
$cancelEndDate = (Get-Date).AddDays(22).ToString("yyyy-MM-dd")

$cancelTestLeave = Invoke-ApiTest `
    -TestName "Create leave for cancellation test" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "PAID"
        startDate = $cancelDate
        endDate = $cancelEndDate
        reason = "Testing cancellation workflow"
    }

if ($cancelTestLeave) {
    $cancelLeaveId = $cancelTestLeave.data.id
    
    # Test 21: Employee cancels own pending leave
    $cancelResponse = Invoke-ApiTest `
        -TestName "Employee cancels own pending leave" `
        -Method "DELETE" `
        -Endpoint "/leaves/$cancelLeaveId" `
        -Token $employeeToken
    
    if ($cancelResponse) {
        Write-Host "  Leave cancelled successfully" -ForegroundColor Gray
    }
}

# Test 22: Try to cancel already approved leave as employee (should fail)
if ($leaveId) {
    Invoke-ApiTest `
        -TestName "Employee tries to cancel approved leave (should fail)" `
        -Method "DELETE" `
        -Endpoint "/leaves/$leaveId" `
        -Token $employeeToken
}

# Test 23: Admin deletes approved leave (should succeed and remove attendance records)
if ($leaveId) {
    $adminDeleteResponse = Invoke-ApiTest `
        -TestName "Admin deletes approved leave (cleanup)" `
        -Method "DELETE" `
        -Endpoint "/leaves/$leaveId" `
        -Token $adminToken
    
    if ($adminDeleteResponse) {
        Write-Host "  Approved leave deleted (attendance records cleaned up)" -ForegroundColor Gray
    }
}

# ============================================
# TEST EDGE CASES
# ============================================

Write-Host "`n--- TEST EDGE CASES ---`n" -ForegroundColor Cyan

# Test 24: Apply for leave with end date before start date (should fail)
Invoke-ApiTest `
    -TestName "Apply for leave with invalid date range (should fail)" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "SICK"
        startDate = $dayAfterTomorrow
        endDate = $tomorrow
        reason = "Invalid date range test"
    }

# Test 25: Apply for leave with invalid leave type (should fail)
Invoke-ApiTest `
    -TestName "Apply for leave with invalid type (should fail)" `
    -Method "POST" `
    -Endpoint "/leaves" `
    -Token $employeeToken `
    -Body @{
        leaveType = "INVALID_TYPE"
        startDate = $tomorrow
        endDate = $dayAfterTomorrow
        reason = "Invalid type test"
    }

# Test 26: Try to access leave API without authentication (should fail)
Invoke-ApiTest `
    -TestName "Access leave API without token (should fail)" `
    -Method "GET" `
    -Endpoint "/leaves" `
    -Token ""

# ============================================
# TEST SUMMARY
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor Yellow

$successRate = [math]::Round(($testsPassed / ($testsPassed + $testsFailed)) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

Write-Host "`n========================================`n" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Leave APIs are working perfectly!" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "✅ Most tests passed. Review failed tests above." -ForegroundColor Yellow
} else {
    Write-Host "⚠️ Many tests failed. Please review the errors above." -ForegroundColor Red
}

