# Test the attendance API with your current token
# Run this script while logged in to see what's happening

Write-Host "Testing Attendance API..." -ForegroundColor Cyan
Write-Host ""

# Get token from user input
$token = Read-Host "Enter your JWT token (from browser localStorage)"

if (-not $token) {
    Write-Host "No token provided" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Testing GET /api/attendance..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $uri = 'http://localhost:5000/api/attendance?month=11&year=2025&limit=100'
    $response = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Red
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 3
    }
}
