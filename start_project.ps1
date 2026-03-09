<#
.SYNOPSIS
    Скрипт автоматического запуска CGM Dashboard проекта.
    
.DESCRIPTION
    Запускает backend (FastAPI) и frontend (React/Vite) серверы.
    Проверяет наличие .env файла и зависимостей.
    
.PARAMETER NoFrontend
    Запустить только backend без frontend.
    
.PARAMETER NoBackend
    Запустить только frontend без backend.
    
.PARAMETER Dev
    Запустить в режиме разработки с подробным логированием.
    
.EXAMPLE
    .\start_project.ps1
    Запуск всего проекта (backend + frontend)
    
.EXAMPLE
    .\start_project.ps1 -NoFrontend
    Запуск только backend API
    
.EXAMPLE
    .\start_project.ps1 -Dev
    Запуск в режиме разработки с подробными логами
    
.NOTES
    Version: 1.0.0
    Author: CGM Dashboard Team
#>

[CmdletBinding()]
param(
    [switch]$NoFrontend,
    [switch]$NoBackend,
    [switch]$Dev
)

# ============================================================================
# КОНФИГУРАЦИЯ
# ============================================================================
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$FrontendDir = Join-Path $ScriptDir "frontend"
$EnvFile = Join-Path $ScriptDir ".env"
$PidFile = Join-Path $ScriptDir ".pids.json"
$LogDir = Join-Path $ScriptDir "logs"

# Цвета вывода
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorWarning = "Yellow"
$ColorInfo = "Cyan"
$ColorStep = "Magenta"

# ============================================================================
# ФУНКЦИИ
# ============================================================================

function Write-Step {
    param([string]$Message)
    Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor $ColorStep
    Write-Host "  $Message" -ForegroundColor $ColorStep
    Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor $ColorStep
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor $ColorSuccess
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor $ColorError
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "  ⚠ $Message" -ForegroundColor $ColorWarning
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ $Message" -ForegroundColor $ColorInfo
}

function Test-Python {
    try {
        $version = python --version 2>&1
        return $true, $version
    } catch {
        return $false, "Python not found"
    }
}

function Test-Node {
    try {
        $version = node --version 2>&1
        return $true, $version
    } catch {
        return $false, "Node.js not found"
    }
}

function Test-PostgreSQL {
    param([string]$Password)
    $env:PGPASSWORD = $Password
    try {
        $result = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -c "SELECT 1" 2>&1
        if ($result -like "*1 row*") {
            return $true, "PostgreSQL connected"
        }
        return $false, "PostgreSQL connection failed"
    } catch {
        return $false, "PostgreSQL not running"
    }
}

function Get-EnvValue {
    param([string]$Key)
    if (Test-Path $EnvFile) {
        $line = Get-Content $EnvFile | Select-String "^$Key="
        if ($line) {
            return ($line -split "=", 2)[1]
        }
    }
    return $null
}

function Save-Pid {
    param([int]$BackendPid, [int]$FrontendPid)
    $pids = @{}
    if ($BackendPid -gt 0) { $pids["backend"] = $BackendPid }
    if ($FrontendPid -gt 0) { $pids["frontend"] = $FrontendPid }
    $pids | ConvertTo-Json | Set-Content $PidFile -Encoding UTF8
}

function Stop-Existing {
    Write-Info "Проверка существующих процессов..."
    
    # Остановка по PID файлу
    if (Test-Path $PidFile) {
        $pids = Get-Content $PidFile | ConvertFrom-Json
        if ($pids.backend) {
            Stop-Process -Id $pids.backend -Force -ErrorAction SilentlyContinue
            Write-Info "Остановлен backend (PID: $($pids.backend))"
        }
        if ($pids.frontend) {
            Stop-Process -Id $pids.frontend -Force -ErrorAction SilentlyContinue
            Write-Info "Остановлен frontend (PID: $($pids.frontend))"
        }
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }
    
    # Остановка по имени процесса
    Get-Process | Where-Object { 
        $_.ProcessName -eq "python" -and $_.CommandLine -like "*backend/main.py*" 
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Get-Process | Where-Object { 
        $_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*" 
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 1
}

# ============================================================================
# ОСНОВНОЙ СЦЕНАРИЙ
# ============================================================================

Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $ColorInfo
Write-Host "║       CGM Dashboard - Запуск проекта                     ║" -ForegroundColor $ColorInfo
Write-Host "║       Госзакупки CGM - Дашборд аналитики                 ║" -ForegroundColor $ColorInfo
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $ColorInfo

# -----------------------------------------------------------------------------
# Шаг 1: Проверка .env файла
# -----------------------------------------------------------------------------
Write-Step "Шаг 1: Проверка конфигурации"

if (!(Test-Path $EnvFile)) {
    Write-Error-Custom "Файл .env не найден!"
    Write-Info "Создайте файл .env на основе .env.example:"
    Write-Host "    Copy-Item .env.example .env"
    Write-Info "Затем отредактируйте .env и укажите пароль PostgreSQL."
    exit 1
}
Write-Success "Файл .env найден"

# Чтение пароля PostgreSQL
$PostgresPassword = Get-EnvValue "POSTGRES_PASSWORD"
if (!$PostgresPassword) {
    Write-Error-Custom "POSTGRES_PASSWORD не указан в .env"
    exit 1
}

# -----------------------------------------------------------------------------
# Шаг 2: Проверка зависимостей
# -----------------------------------------------------------------------------
Write-Step "Шаг 2: Проверка зависимостей"

# Python
$pythonOk, $pythonVersion = Test-Python
if ($pythonOk) {
    Write-Success "Python: $pythonVersion"
} else {
    Write-Error-Custom "Python не найден. Установите Python 3.14+"
    exit 1
}

# Node.js
$nodeOk, $nodeVersion = Test-Node
if ($nodeOk) {
    Write-Success "Node.js: $nodeVersion"
} else {
    Write-Error-Custom "Node.js не найден. Установите Node.js 18+"
    exit 1
}

# PostgreSQL
$pgOk, $pgStatus = Test-PostgreSQL -Password $PostgresPassword
if ($pgOk) {
    Write-Success "PostgreSQL: $pgStatus"
} else {
    Write-Error-Custom "PostgreSQL не доступен. Запустите PostgreSQL."
    Write-Info "Команда для запуска:"
    Write-Host "    & 'C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe' start -D 'C:\pg_data'"
    exit 1
}

# -----------------------------------------------------------------------------
# Шаг 3: Проверка зависимостей Python
# -----------------------------------------------------------------------------
Write-Step "Шаг 3: Проверка Python зависимостей"

$backendReq = Join-Path $BackendDir "requirements.txt"
if (Test-Path $backendReq) {
    $checkFastapi = pip show fastapi 2>&1
    if ($checkFastapi -like "*fastapi*") {
        Write-Success "Backend зависимости установлены"
    } else {
        Write-Warning-Custom "Backend зависимости не найдены. Установка..."
        pip install -r $backendReq
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backend зависимости установлены"
        } else {
            Write-Error-Custom "Ошибка установки backend зависимостей"
            exit 1
        }
    }
}

# -----------------------------------------------------------------------------
# Шаг 4: Проверка зависимостей Node.js
# -----------------------------------------------------------------------------
if (!$NoFrontend) {
    Write-Step "Шаг 4: Проверка Node.js зависимостей"
    
    $packageJson = Join-Path $FrontendDir "package.json"
    $nodeModules = Join-Path $FrontendDir "node_modules"
    
    if (!(Test-Path $nodeModules)) {
        Write-Warning-Custom "node_modules не найден. Установка зависимостей..."
        Set-Location $FrontendDir
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend зависимости установлены"
        } else {
            Write-Error-Custom "Ошибка установки frontend зависимостей"
            exit 1
        }
        Set-Location $ScriptDir
    } else {
        Write-Success "Frontend зависимости установлены"
    }
}

# -----------------------------------------------------------------------------
# Шаг 5: Остановка существующих процессов
# -----------------------------------------------------------------------------
Write-Step "Шаг 5: Остановка существующих серверов"
Stop-Existing
Write-Success "Существующие процессы остановлены"

# -----------------------------------------------------------------------------
# Шаг 6: Запуск Backend
# -----------------------------------------------------------------------------
$backendPid = 0

if (!$NoBackend) {
    Write-Step "Шаг 6: Запуск Backend API"
    
    # Создание директории логов
    if (!(Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir | Out-Null
    }
    
    $backendLog = Join-Path $LogDir "backend_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    
    $backendArgs = @(
        (Join-Path $BackendDir "main.py")
    )
    
    if ($Dev) {
        Write-Info "Режим разработки: подробное логирование"
        $env:LOG_LEVEL = "DEBUG"
    }
    
    # Запуск backend в фоновом режиме
    $process = Start-Process python `
        -ArgumentList $backendArgs `
        -WorkingDirectory $BackendDir `
        -PassThru `
        -RedirectStandardOutput $backendLog `
        -RedirectStandardError $backendLog `
        -WindowStyle Hidden
    
    $backendPid = $process.Id
    Write-Info "Backend запущен с PID: $backendPid"
    Write-Info "Лог файл: $backendLog"
    
    # Ожидание запуска backend
    Write-Info "Ожидание запуска backend (до 10 секунд)..."
    $maxAttempts = 20
    $attempt = 0
    $backendReady = $false
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Milliseconds 500
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -ErrorAction Stop
            if ($response.status -eq "ok") {
                $backendReady = $true
                break
            }
        } catch {
            $attempt++
        }
    }
    
    if ($backendReady) {
        Write-Success "Backend API запущен: http://localhost:8000"
        Write-Success "Swagger документация: http://localhost:8000/docs"
    } else {
        Write-Error-Custom "Backend не запустился. Проверьте лог: $backendLog"
        Get-Content $backendLog -Tail 20
        exit 1
    }
}

# -----------------------------------------------------------------------------
# Шаг 7: Запуск Frontend
# -----------------------------------------------------------------------------
$frontendPid = 0

if (!$NoFrontend) {
    Write-Step "Шаг 7: Запуск Frontend"
    
    $frontendLog = Join-Path $LogDir "frontend_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    
    # Запуск frontend в фоновом режиме
    $process = Start-Process npm `
        -ArgumentList "run", "dev" `
        -WorkingDirectory $FrontendDir `
        -PassThru `
        -WindowStyle Hidden
    
    $frontendPid = $process.Id
    Write-Info "Frontend запущен с PID: $frontendPid"
    
    # Ожидание запуска frontend
    Write-Info "Ожидание запуска frontend (до 10 секунд)..."
    $maxAttempts = 20
    $attempt = 0
    $frontendReady = $false
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Milliseconds 500
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:5173" -Method Get -ErrorAction Stop
            $frontendReady = $true
            break
        } catch {
            $attempt++
        }
    }
    
    if ($frontendReady) {
        Write-Success "Frontend запущен: http://localhost:5173"
    } else {
        Write-Warning-Custom "Frontend может запускаться дольше обычного"
    }
}

# -----------------------------------------------------------------------------
# Шаг 8: Сохранение PID и завершение
# -----------------------------------------------------------------------------
Write-Step "Шаг 8: Завершение"

Save-Pid -BackendPid $backendPid -FrontendPid $frontendPid
Write-Success "PID процессов сохранены в .pids.json"

Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $ColorSuccess
Write-Host "║              ПРОЕКТ УСПЕШНО ЗАПУЩЕН!                     ║" -ForegroundColor $ColorSuccess
Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor $ColorSuccess
if (!$NoBackend) {
    Write-Host "║  Backend API:  http://localhost:8000                     ║" -ForegroundColor $ColorInfo
    Write-Host "║  Swagger:      http://localhost:8000/docs                ║" -ForegroundColor $ColorInfo
}
if (!$NoFrontend) {
    Write-Host "║  Frontend:     http://localhost:5173                     ║" -ForegroundColor $ColorInfo
}
Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor $ColorSuccess
Write-Host "║  Для остановки выполните: .\stop_project.ps1             ║" -ForegroundColor $ColorWarning
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $ColorSuccess
Write-Host "`n"
