# Comprehensive Attendance API Test
$baseUrl = "http://localhost:5000"
$ErrorActionPreference = "Continue"

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "ATTENDANCE API COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# Test 1: Login
Write-Host "`n[TEST 1] Login as Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        loginId = "OIADUS20200001"
        password = "Password123!"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    $headers = @{ "Authorization" = "Bearer $token" }
    
    Write-Host "  PASS - Login successful" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0,30))..." -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  FAIL - Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
    exit
}

# Test 2: Get employees
Write-Host "`n[TEST 2] Get employees list..." -ForegroundColor Yellow
try {
    $employeesResponse = Invoke-RestMethod -Uri "$baseUrl/api/employees?page=1&limit=5" `
        -Method GET `
        -Headers $headers
    
    $employeeId = $employeesResponse.data[0].id
    $employeeName = "$($employeesResponse.data[0].firstName) $($employeesResponse.data[0].lastName)"
    
    Write-Host "  PASS - Found $($employeesResponse.pagination.total) employees" -ForegroundColor Green
    Write-Host "  Testing with: $employeeName (ID: $employeeId)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Check-in
Write-Host "`n[TEST 3] POST /api/attendance/check-in..." -ForegroundColor Yellow
try {
    $checkInBody = @{
        remarks = "Test check-in $(Get-Date -Format 'HH:mm:ss')"
    } | ConvertTo-Json
    
    $checkInResponse = Invoke-RestMethod -Uri "$baseUrl/api/attendance/check-in" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $checkInBody
    
    Write-Host "  PASS - Check-in successful" -ForegroundColor Green
    Write-Host "  Attendance ID: $($checkInResponse.data.id)" -ForegroundColor Gray
    Write-Host "  Check-in time: $($checkInResponse.data.checkIn)" -ForegroundColor Gray
    Write-Host "  Status: $($checkInResponse.data.status)" -ForegroundColor Gray
    $testsPassed++
    $attendanceId = $checkInResponse.data.id
} catch {
    $errorMsg = ""
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        try {
            $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
        } catch {
            $errorMsg = $_.Exception.Message
        }
    } else {
        $errorMsg = $_.Exception.Message
    }
    
    if ($errorMsg -like "*already marked*") {
        Write-Host "  PASS - Duplicate prevention working (already checked in)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL - $errorMsg" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 4: Duplicate check-in prevention
Write-Host "`n[TEST 4] Test duplicate check-in prevention..." -ForegroundColor Yellow
try {
    $checkInBody = @{
        remarks = "Duplicate attempt"
    } | ConvertTo-Json
    
    $dupResponse = Invoke-RestMethod -Uri "$baseUrl/api/attendance/check-in" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $checkInBody
    
    Write-Host "  FAIL - Duplicate check-in should have been prevented!" -ForegroundColor Red
    $testsFailed++
} catch {
    $errorMsg = ""
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        try {
            $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
        } catch {
            $errorMsg = $_.Exception.Message
        }
    } else {
        $errorMsg = $_.Exception.Message
    }
    
    if ($errorMsg -like "*already marked*") {
        Write-Host "  PASS - Duplicate prevention working correctly" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL - Wrong error: $errorMsg" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 5: Get own attendance (current month)
Write-Host "`n[TEST 5] GET /api/attendance/employee/:id (current month)..." -ForegroundColor Yellow
try {
    $month = (Get-Date).Month
    $year = (Get-Date).Year
    
    $attendanceResponse = Invoke-RestMethod -Uri "$baseUrl/api/attendance/employee/${employeeId}?month=$month&year=$year" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  PASS - Retrieved attendance records" -ForegroundColor Green
    Write-Host "  Total records: $($attendanceResponse.data.Count)" -ForegroundColor Gray
    Write-Host "  Total hours: $([math]::Round($attendanceResponse.statistics.totalHours, 2))" -ForegroundColor Gray
    Write-Host "  Present days: $($attendanceResponse.statistics.present)" -ForegroundColor Gray
    Write-Host "  Absent days: $($attendanceResponse.statistics.absent)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 6: List all attendance with pagination
Write-Host "`n[TEST 6] GET /api/attendance (with pagination)..." -ForegroundColor Yellow
try {
    $month = (Get-Date).Month
    $year = (Get-Date).Year
    
    $allAttendance = Invoke-RestMethod -Uri "$baseUrl/api/attendance?page=1&limit=10&month=$month&year=$year" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  PASS - Retrieved all attendance records" -ForegroundColor Green
    Write-Host "  Total records: $($allAttendance.pagination.total)" -ForegroundColor Gray
    Write-Host "  Page: $($allAttendance.pagination.page) of $($allAttendance.pagination.totalPages)" -ForegroundColor Gray
    Write-Host "  Records on page: $($allAttendance.data.Count)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 7: Filter by today's date
Write-Host "`n[TEST 7] GET /api/attendance (filter by today)..." -ForegroundColor Yellow
try {
    $today = (Get-Date).ToString("yyyy-MM-dd")
    
    $todayAttendance = Invoke-RestMethod -Uri "$baseUrl/api/attendance?startDate=$today&endDate=$today" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  PASS - Retrieved today's attendance" -ForegroundColor Green
    Write-Host "  Employees present today: $($todayAttendance.data.Count)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 8: Generate attendance report
Write-Host "`n[TEST 8] GET /api/attendance/report..." -ForegroundColor Yellow
try {
    $month = (Get-Date).Month
    $year = (Get-Date).Year
    
    $report = Invoke-RestMethod -Uri "$baseUrl/api/attendance/report?month=$month&year=$year" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  PASS - Report generated successfully" -ForegroundColor Green
    Write-Host "  Total records: $($report.data.summary.totalRecords)" -ForegroundColor Gray
    Write-Host "  Total hours: $([math]::Round($report.data.summary.totalHours, 2))" -ForegroundColor Gray
    
    # Status breakdown
    $presentCount = ($report.data.statusBreakdown | Where-Object { $_.status -eq 'PRESENT' }).count
    $absentCount = ($report.data.statusBreakdown | Where-Object { $_.status -eq 'ABSENT' }).count
    $halfDayCount = ($report.data.statusBreakdown | Where-Object { $_.status -eq 'HALF_DAY' }).count
    $leaveCount = ($report.data.statusBreakdown | Where-Object { $_.status -eq 'LEAVE' }).count
    
    Write-Host "  Present: $presentCount" -ForegroundColor Gray
    Write-Host "  Absent: $absentCount" -ForegroundColor Gray
    Write-Host "  Half Day: $halfDayCount" -ForegroundColor Gray
    Write-Host "  Leave: $leaveCount" -ForegroundColor Gray
    
    if ($report.data.departmentBreakdown.Count -gt 0) {
        Write-Host "  Department breakdown:" -ForegroundColor Gray
        foreach ($dept in $report.data.departmentBreakdown) {
            Write-Host "    - $($dept.department): $($dept.totalRecords) records" -ForegroundColor Gray
        }
    }
    $testsPassed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 9: Manual attendance entry
Write-Host "`n[TEST 9] POST /api/attendance/manual..." -ForegroundColor Yellow
try {
    $yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
    
    $manualBody = @{
        employeeId = $employeeId
        date = $yesterday
        checkIn = "${yesterday}T09:00:00.000Z"
        checkOut = "${yesterday}T18:00:00.000Z"
        status = "PRESENT"
        remarks = "Manual entry test"
    } | ConvertTo-Json
    
    $manualResponse = Invoke-RestMethod -Uri "$baseUrl/api/attendance/manual" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $manualBody
    
    Write-Host "  PASS - Manual attendance created" -ForegroundColor Green
    Write-Host "  Date: $($manualResponse.data.date)" -ForegroundColor Gray
    Write-Host "  Working hours: $($manualResponse.data.workingHours)" -ForegroundColor Gray
    Write-Host "  Is manual: $($manualResponse.data.isManual)" -ForegroundColor Gray
    $testsPassed++
} catch {
    $errorMsg = ""
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        try {
            $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
        } catch {
            $errorMsg = $_.Exception.Message
        }
    } else {
        $errorMsg = $_.Exception.Message
    }
    
    if ($errorMsg -like "*already exists*") {
        Write-Host "  PASS - Entry already exists (expected on re-run)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL - $errorMsg" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 10: Check-out
Write-Host "`n[TEST 10] POST /api/attendance/check-out..." -ForegroundColor Yellow
try {
    $checkOutBody = @{
        remarks = "Test check-out $(Get-Date -Format 'HH:mm:ss')"
    } | ConvertTo-Json
    
    $checkOutResponse = Invoke-RestMethod -Uri "$baseUrl/api/attendance/check-out" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $checkOutBody
    
    Write-Host "  PASS - Check-out successful" -ForegroundColor Green
    Write-Host "  Check-out time: $($checkOutResponse.data.checkOut)" -ForegroundColor Gray
    Write-Host "  Working hours: $([math]::Round($checkOutResponse.data.workingHours, 2))" -ForegroundColor Gray
    $testsPassed++
} catch {
    $errorMsg = ""
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        try {
            $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
        } catch {
            $errorMsg = $_.Exception.Message
        }
    } else {
        $errorMsg = $_.Exception.Message
    }
    
    Write-Host "  INFO - $errorMsg" -ForegroundColor Yellow
    if ($errorMsg -like "*already checked out*" -or $errorMsg -like "*No active check-in*" -or $errorMsg -like "*not found*") {
        Write-Host "  PASS - Endpoint working (already checked out or no active check-in)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL - Unexpected error: $errorMsg" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 11: Update attendance (if we have an ID)
if ($attendanceId) {
    Write-Host "`n[TEST 11] PUT /api/attendance/:id..." -ForegroundColor Yellow
    try {
        $updateBody = @{
            status = "PRESENT"
            remarks = "Updated via test script"
        } | ConvertTo-Json
        
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/attendance/$attendanceId" `
            -Method PUT `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $updateBody
        
        Write-Host "  PASS - Attendance updated" -ForegroundColor Green
        Write-Host "  Updated remarks: $($updateResponse.data.remarks)" -ForegroundColor Gray
        $testsPassed++
    } catch {
        Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
}

# Summary
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White

if ($testsFailed -eq 0) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Attendance APIs are working correctly." -ForegroundColor Green
} else {
    Write-Host "`nSOME TESTS FAILED!" -ForegroundColor Red
    Write-Host "Please review the errors above." -ForegroundColor Yellow
}

Write-Host "=====================================" -ForegroundColor Cyan
