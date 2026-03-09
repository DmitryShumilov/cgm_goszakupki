# Проверка профиля PowerShell
$profilePath = $PROFILE
Write-Host "Profile path: $profilePath"
Write-Host ""

if (Test-Path $profilePath) {
    Write-Host "File exists: YES" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== File Content ===" -ForegroundColor Cyan
    Get-Content $profilePath -Raw
    Write-Host "=== End of Content ===" -ForegroundColor Cyan
} else {
    Write-Host "File exists: NO" -ForegroundColor Red
    Write-Host "Create with: New-Item -ItemType File -Path `$PROFILE -Force"
}
