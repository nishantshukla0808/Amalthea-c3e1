# Quick test for payslip update and recalculate
$baseUrl = "http://localhost:5000/api"

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

# Get first payslip
$payslips = Invoke-RestMethod -Uri "$baseUrl/payroll/payslips" -Method GET -Headers $headers
$payslipId = $payslips.data[0].id
$payslip = $payslips.data[0]

Write-Host "Testing Payslip: $payslipId"
Write-Host "  Employee: $($payslip.employeeName)"
Write-Host "  Status: $($payslip.payrun.status)"
Write-Host "  IsEditable: $($payslip.isEditable)"
Write-Host ""

# Try to update
Write-Host "Testing UPDATE..." -ForegroundColor Yellow
try {
    $updateBody = @{
        tdsDeduction = 1000
        otherDeductions = 500
    } | ConvertTo-Json
    
    $updated = Invoke-RestMethod -Uri "$baseUrl/payroll/payslips/$payslipId" -Method PUT -Headers $headers -Body $updateBody
    Write-Host "  SUCCESS!" -ForegroundColor Green
} catch {
    $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ERROR: $($errorDetail.error)" -ForegroundColor Red
}

# Try to recompute
Write-Host "`nTesting RECALCULATE..." -ForegroundColor Yellow
try {
    $recomputed = Invoke-RestMethod -Uri "$baseUrl/payroll/payslips/$payslipId/compute" -Method PUT -Headers $headers -Body "{}"
    Write-Host "  SUCCESS!" -ForegroundColor Green
} catch {
    $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ERROR: $($errorDetail.error)" -ForegroundColor Red
}
