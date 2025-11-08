# Test Employee Management APIs
Write-Host "=== Testing Employee Management APIs ===" -ForegroundColor Cyan

# Login
Write-Host "`n1. Logging in as Admin..." -ForegroundColor Yellow
$loginBody = @{
    loginId = 'OIADUS20200001'
    password = 'NewPassword123!'
} | ConvertTo-Json

$loginResp = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' `
    -Method POST `
    -Body $loginBody `
    -ContentType 'application/json'

$token = ($loginResp.Content | ConvertFrom-Json).token
Write-Host "✅ Login successful!" -ForegroundColor Green

# Test 1: List Employees
Write-Host "`n2. GET /api/employees - List all employees" -ForegroundColor Yellow
$listResp = Invoke-WebRequest -Uri 'http://localhost:5000/api/employees?page=1&limit=10' `
    -Headers @{Authorization="Bearer $token"}
$employees = ($listResp.Content | ConvertFrom-Json)
Write-Host "✅ Total Employees: $($employees.pagination.total)" -ForegroundColor Green
$employees.data | Select-Object employeeId, firstName, lastName, department | Format-Table

# Test 2: Get Specific Employee
Write-Host "`n3. GET /api/employees/:id - Get John Doe" -ForegroundColor Yellow
$johnEmp = $employees.data | Where-Object { $_.firstName -eq 'John' -and $_.lastName -eq 'Doe' } | Select-Object -First 1
$getResp = Invoke-WebRequest -Uri "http://localhost:5000/api/employees/$($johnEmp.id)" `
    -Headers @{Authorization="Bearer $token"}
$empDetail = ($getResp.Content | ConvertFrom-Json).data
Write-Host "✅ Employee: $($empDetail.firstName) $($empDetail.lastName)" -ForegroundColor Green
Write-Host "   Department: $($empDetail.department)"
Write-Host "   Designation: $($empDetail.designation)"

# Test 3: Update Employee
Write-Host "`n4. PUT /api/employees/:id - Update John Doe" -ForegroundColor Yellow
$updateBody = @{
    designation = 'Lead Full Stack Developer'
    phoneNumber = '+1234567890'
    address = '123 Innovation Street, Tech City'
    department = 'Engineering'
} | ConvertTo-Json

$updateResp = Invoke-WebRequest -Uri "http://localhost:5000/api/employees/$($johnEmp.id)" `
    -Method PUT `
    -Body $updateBody `
    -ContentType 'application/json' `
    -Headers @{Authorization="Bearer $token"}
    
$updated = ($updateResp.Content | ConvertFrom-Json).data
Write-Host "✅ Employee Updated!" -ForegroundColor Green
Write-Host "   New Designation: $($updated.designation)"
Write-Host "   New Department: $($updated.department)"
Write-Host "   New Phone: $($updated.phoneNumber)"
Write-Host "   New Address: $($updated.address)"

# Test 4: Get Full Profile
Write-Host "`n5. GET /api/employees/:id/profile - Get Alice's full profile" -ForegroundColor Yellow
$alice = $employees.data | Where-Object { $_.firstName -eq 'Alice' } | Select-Object -First 1
$profileResp = Invoke-WebRequest -Uri "http://localhost:5000/api/employees/$($alice.id)/profile" `
    -Headers @{Authorization="Bearer $token"}
$profile = ($profileResp.Content | ConvertFrom-Json).data
Write-Host "✅ Full Profile Retrieved!" -ForegroundColor Green
Write-Host "   Name: $($profile.firstName) $($profile.lastName)"
Write-Host "   Has Salary Structure: $($null -ne $profile.salaryStructure)"
Write-Host "   Attendances: $($profile.attendances.Count) records"
Write-Host "   Leaves: $($profile.leaves.Count) records"
Write-Host "   Payslips: $($profile.payslips.Count) records"

# Test 5: Search & Filter
Write-Host "`n6. GET /api/employees?search=Engineering - Filter by department" -ForegroundColor Yellow
$searchResp = Invoke-WebRequest -Uri 'http://localhost:5000/api/employees?department=Engineering&limit=5' `
    -Headers @{Authorization="Bearer $token"}
$engineeringEmps = ($searchResp.Content | ConvertFrom-Json)
Write-Host "✅ Engineering Employees: $($engineeringEmps.pagination.total)" -ForegroundColor Green
$engineeringEmps.data | Select-Object employeeId, firstName, lastName, designation | Format-Table

Write-Host "`n=== All Tests Completed Successfully! ===" -ForegroundColor Green
