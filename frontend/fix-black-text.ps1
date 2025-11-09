# Change all text colors to black for light backgrounds
$files = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        
        # Replace all gray text colors with black
        $content = $content -replace 'text-gray-700\b','text-black'
        $content = $content -replace 'text-gray-800\b','text-black'
        $content = $content -replace 'text-gray-900\b','text-black'
        
        # Replace specific light gray variants
        $content = $content -replace 'text-slate-700\b','text-black'
        $content = $content -replace 'text-slate-800\b','text-black'
        $content = $content -replace 'text-slate-900\b','text-black'
        
        # Replace zinc grays
        $content = $content -replace 'text-zinc-700\b','text-black'
        $content = $content -replace 'text-zinc-800\b','text-black'
        $content = $content -replace 'text-zinc-900\b','text-black'
        
        [System.IO.File]::WriteAllText($file.FullName, $content)
        
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host \"
 All files updated to use black text!\" -ForegroundColor Green
Write-Host \"Updated $($files.Count) files\" -ForegroundColor Cyan
