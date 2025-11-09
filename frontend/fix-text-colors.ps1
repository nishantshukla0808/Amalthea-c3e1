# Change all text colors to black for light backgrounds
$files = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse

$totalUpdated = 0

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $originalContent = $content
        
        # Replace all gray text colors with black
        $content = $content -replace '\btext-gray-700\b','text-black'
        $content = $content -replace '\btext-gray-800\b','text-black'
        $content = $content -replace '\btext-gray-900\b','text-black'
        $content = $content -replace '\btext-gray-600\b','text-black'
        $content = $content -replace '\btext-gray-500\b','text-black'
        
        # Replace slate variants
        $content = $content -replace '\btext-slate-700\b','text-black'
        $content = $content -replace '\btext-slate-800\b','text-black'
        $content = $content -replace '\btext-slate-900\b','text-black'
        
        # Replace zinc grays
        $content = $content -replace '\btext-zinc-700\b','text-black'
        $content = $content -replace '\btext-zinc-800\b','text-black'
        $content = $content -replace '\btext-zinc-900\b','text-black'
        
        # Replace neutral grays
        $content = $content -replace '\btext-neutral-700\b','text-black'
        $content = $content -replace '\btext-neutral-800\b','text-black'
        $content = $content -replace '\btext-neutral-900\b','text-black'
        
        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            $totalUpdated++
            Write-Host "  ✅ Updated" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  ⚠️ Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Green
Write-Host "Total files checked: $($files.Count)" -ForegroundColor Cyan
Write-Host "Files updated: $totalUpdated" -ForegroundColor Cyan
