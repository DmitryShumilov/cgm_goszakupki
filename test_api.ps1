$response = Invoke-RestMethod -Uri "http://localhost:8000/api/charts/dynamics" -Method Post -ContentType "application/json" -Body '{}'
$response | ConvertTo-Json -Depth 5
