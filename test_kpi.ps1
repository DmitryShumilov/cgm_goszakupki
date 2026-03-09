$response = Invoke-RestMethod -Uri "http://localhost:8000/api/kpi" -Method Post -ContentType "application/json" -Body '{}'
Write-Host "KPI Data:"
$response | Format-List
