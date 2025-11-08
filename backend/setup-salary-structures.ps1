# ========================================
# SETUP SALARY STRUCTURES
# Creates salary structures for test employees
# ========================================

$baseUrl = "http://localhost:5000/api"

Write-Host "`nSetting up salary structures..." -ForegroundColor Cyan

# Login
$loginBody = @{
    loginId = "OIADUS20200001"
    password = "Password123!"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $authResponse.token
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Use known employee IDs from fixtures
$aliceId = "00000000-0000-4000-8000-000000000110"
$bobId = "00000000-0000-4000-8000-000000000111"

Write-Host "Using employee IDs:"
Write-Host "  Alice: $aliceId"
Write-Host "  Bob: $bobId"

# Create salary structure for Alice
Write-Host "`nCreating salary structure for Alice..." -ForegroundColor Yellow
$aliceStructure = @{
    employeeId = $aliceId
    monthlyWage = 50000
    pfPercentage = 12
    professionalTax = 200
    effectiveFrom = "2025-01-01"
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod -Uri "$baseUrl/payroll/salary-structure" -Method POST -Headers $headers -Body $aliceStructure
    Write-Host "  CREATED: Rs $($created.data.monthlyWage)/month" -ForegroundColor Green
} catch {
    Write-Host "  Already exists: $_" -ForegroundColor Yellow
}

# Create salary structure for Bob
Write-Host "`nCreating salary structure for Bob..." -ForegroundColor Yellow
$bobStructure = @{
    employeeId = $bobId
    monthlyWage = 45000
    pfPercentage = 12
    professionalTax = 200
    effectiveFrom = "2025-01-01"
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod -Uri "$baseUrl/payroll/salary-structure" -Method POST -Headers $headers -Body $bobStructure
    Write-Host "  CREATED: Rs $($created.data.monthlyWage)/month" -ForegroundColor Green
} catch {
    Write-Host "  Already exists: $_" -ForegroundColor Yellow
}

# Verify
Write-Host "`nVerifying structures..." -ForegroundColor Cyan
$structures = Invoke-RestMethod -Uri "$baseUrl/payroll/salary-structure" -Method GET -Headers $headers
Write-Host "Total structures: $($structures.data.Count)" -ForegroundColor Green

$structures.data | ForEach-Object {
    Write-Host "  - $($_.employee.firstName) $($_.employee.lastName): Rs $($_.monthlyWage)/month"
}

Write-Host "`nSetup complete!`n" -ForegroundColor Green
