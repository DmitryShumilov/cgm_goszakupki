$pgPath = "C:\Program Files\PostgreSQL\17"
$dataDir = "$pgPath\data"
$pgCtl = "$pgPath\bin\pg_ctl.exe"

Write-Host "=============================================="
Write-Host "ПРОВЕРКА POSTGRESQL"
Write-Host "=============================================="

# Проверка наличия pg_ctl
if (Test-Path $pgCtl) {
    Write-Host "[OK] pg_ctl найден: $pgCtl"
} else {
    Write-Host "[ERROR] pg_ctl не найден"
    exit 1
}

# Проверка наличия data директории
if (Test-Path $dataDir) {
    Write-Host "[OK] Data директория: $dataDir"
} else {
    Write-Host "[ERROR] Data директория не найдена"
    exit 1
}

# Проверка статуса
Write-Host "`nПроверка статуса службы..."
& $pgCtl status -D $dataDir
$status = $LASTEXITCODE

if ($status -eq 0) {
    Write-Host "`n[OK] PostgreSQL запущен"
} elseif ($status -eq 3) {
    Write-Host "`n[WARNING] PostgreSQL остановлен. Запускаем..."
    & $pgCtl start -D $dataDir -l "$dataDir\logfile.log"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] PostgreSQL запущен успешно"
    } else {
        Write-Host "[ERROR] Не удалось запустить PostgreSQL"
    }
} else {
    Write-Host "`n[ERROR] Не удалось определить статус (код: $status)"
}

Write-Host "`n=============================================="
