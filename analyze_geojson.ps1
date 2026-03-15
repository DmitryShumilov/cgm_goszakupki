# Анализ GeoJSON файлов
$ErrorActionPreference = 'Stop'

Write-Host "`n=== Анализ GeoJSON файлов ===`n" -ForegroundColor Cyan

# Анализ первого файла
Write-Host "1. russia_regions.geojson (26.7 MB)" -ForegroundColor Yellow
try {
  $json1 = Get-Content 'C:\Dashboards\cgm_goszakupki\frontend_map\public\russia_regions.geojson' -Raw | ConvertFrom-Json
  $count1 = $json1.features.Count
  Write-Host "   Количество регионов: $count1" -ForegroundColor Green
  
  # Первые 10 названий
  Write-Host "   Первые 10 регионов:" -ForegroundColor Gray
  $json1.features | Select-Object -First 10 | ForEach-Object {
    $name = $_.properties.name
    if ($name) {
      Write-Host "     - $name" -ForegroundColor Gray
    }
  }
  
  # Проверка структуры
  $firstFeature = $json1.features[0]
  Write-Host "   Структура properties:" -ForegroundColor Gray
  $firstFeature.properties.PSObject.Properties.Name -join ', ' | Write-Host
} catch {
  Write-Host "   Ошибка: $_" -ForegroundColor Red
}

Write-Host ""

# Анализ второго файла
Write-Host "2. simple_map.geojson (52.6 MB)" -ForegroundColor Yellow
try {
  $json2 = Get-Content 'C:\Dashboards\cgm_goszakupki\frontend_map\public\simple_map.geojson' -Raw | ConvertFrom-Json
  $count2 = $json2.features.Count
  Write-Host "   Количество регионов: $count2" -ForegroundColor Green
  
  # Первые 10 названий
  Write-Host "   Первые 10 регионов:" -ForegroundColor Gray
  $json2.features | Select-Object -First 10 | ForEach-Object {
    $name = $_.properties.name
    if ($name) {
      Write-Host "     - $name" -ForegroundColor Gray
    }
  }
  
  # Проверка структуры
  $firstFeature = $json2.features[0]
  Write-Host "   Структура properties:" -ForegroundColor Gray
  $firstFeature.properties.PSObject.Properties.Name -join ', ' | Write-Host
} catch {
  Write-Host "   Ошибка: $_" -ForegroundColor Red
}

Write-Host "`n=== Рекомендация ===" -ForegroundColor Cyan
Write-Host "Для веб-карты выбирайте файл с МЕНЬШИМ размером (быстрее загрузка)" -ForegroundColor White
Write-Host "Если нужны точные границы - выбирайте файл с БОЛЬШИМ размером" -ForegroundColor White
