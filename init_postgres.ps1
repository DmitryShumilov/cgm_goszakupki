$pgPath = "C:\Program Files\PostgreSQL\17"
$dataDir = "$pgPath\data"
$pgBin = "$pgPath\bin"
$initDb = "$pgBin\initdb.exe"
$pgCtl = "$pgBin\pg_ctl.exe"

Write-Host "=============================================="
Write-Host "ИНИЦИАЛИЗАЦИЯ POSTGRESQL"
Write-Host "=============================================="

# Проверка наличия initdb
if (Test-Path $initDb) {
    Write-Host "[OK] initdb найден: $initDb"
} else {
    Write-Host "[ERROR] initdb не найден"
    exit 1
}

# Очистка data директории (если там что-то есть)
Write-Host "`nОчистка data директории..."
Get-ChildItem -Path $dataDir -Recurse | Remove-Item -Force -Recurse
Write-Host "[OK] Директория очищена"

# Инициализация кластера
Write-Host "`nИнициализация кластера базы данных..."
& $initDb -D $dataDir -E UTF8 --locale=Russian-Russia.1251
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Кластер успешно инициализирован"
} else {
    Write-Host "[ERROR] Ошибка инициализации (код: $LASTEXITCODE)"
    exit 1
}

# Запуск PostgreSQL
Write-Host "`nЗапуск PostgreSQL..."
& $pgCtl start -D $dataDir -l "$dataDir\logfile.log"
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] PostgreSQL запущен"
} else {
    Write-Host "[ERROR] Не удалось запустить PostgreSQL"
    exit 1
}

# Пауза для запуска
Start-Sleep -Seconds 3

Write-Host "`n=============================================="
Write-Host "ГОТОВО! PostgreSQL готов к работе"
Write-Host "=============================================="
Write-Host "Хост: localhost"
Write-Host "Порт: 5432"
Write-Host "Пользователь: postgres"
Write-Host "=============================================="
