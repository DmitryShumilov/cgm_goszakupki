# Скрипт для выполнения VACUUM ANALYZE базы данных PostgreSQL
# Использование: .\run_vacuum.ps1

# Параметры подключения
$host = "localhost"
$port = "5432"
$user = "postgres"
$database = "cgm_dashboard"

# Путь к pg_ctl
$pgPath = "C:\Program Files\PostgreSQL\17\bin"

# Логирование
$logFile = "logs\vacuum_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$logDir = Split-Path $logFile

if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}

Write-Host "[$(Get-Date)] Запуск VACUUM ANALYZE для базы данных $database" -ForegroundColor Cyan

# Выполнение VACUUM ANALYZE
try {
    $query = "VACUUM ANALYZE;"
    
    & "$pgPath\psql.exe" -h $host -p $port -U $user -d $database -c $query 2>&1 | Tee-Object -FilePath $logFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$(Get-Date)] VACUUM ANALYZE успешно выполнен" -ForegroundColor Green
        Write-Host "[$(Get-Date)] Лог сохранён: $logFile" -ForegroundColor Gray
    } else {
        Write-Host "[$(Get-Date)] Ошибка выполнения VACUUM ANALYZE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[$(Get-Date)] Исключение: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[$(Get-Date)] Завершение работы скрипта" -ForegroundColor Cyan
