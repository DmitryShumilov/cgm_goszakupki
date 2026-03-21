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
$FrontendMapDir = Join-Path $ScriptDir "frontend_map"
$FrontendCompareDir = Join-Path $ScriptDir "frontend_compare"
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

function Get-PostgresPath {
    <#
    .SYNOPSIS
        Находит путь к PostgreSQL psql.exe.
    #>
    # Проверка стандартных путей установки
    $paths = @(
        "C:\Program Files\PostgreSQL\17\bin",
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin"
    )
    foreach ($p in $paths) {
        if (Test-Path "$p\psql.exe") {
            Write-Info "PostgreSQL найден: $p"
            return $p
        }
    }
    # Поиск через where.exe
    $result = where.exe psql 2>$null
    if ($result) {
        $path = Split-Path $result[0]
        Write-Info "PostgreSQL найден через where.exe: $path"
        return $path
    }
    return $null
}

function Test-PostgreSQL {
    param([string]$Password)
    
    # Простая проверка - слушаем ли порт 5432
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", 5432)
        $tcpClient.Close()
        return $true, "PostgreSQL running on port 5432"
    } catch {
        return $false, "PostgreSQL not running on port 5432"
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
    param([int]$BackendPid, [int]$FrontendPid, [int]$FrontendMapPid, [int]$FrontendComparePid)
    $pids = @{}
    if ($BackendPid -gt 0) { $pids["backend"] = $BackendPid }
    if ($FrontendPid -gt 0) { $pids["frontend"] = $FrontendPid }
    if ($FrontendMapPid -gt 0) { $pids["frontend_map"] = $FrontendMapPid }
    if ($FrontendComparePid -gt 0) { $pids["frontend_compare"] = $FrontendComparePid }
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
        if ($pids.frontend_map) {
            Stop-Process -Id $pids.frontend_map -Force -ErrorAction SilentlyContinue
            Write-Info "Остановлен frontend_map (PID: $($pids.frontend_map))"
        }
        if ($pids.frontend_compare) {
            Stop-Process -Id $pids.frontend_compare -Force -ErrorAction SilentlyContinue
            Write-Info "Остановлен frontend_compare (PID: $($pids.frontend_compare))"
        }
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }

    # Остановка по имени процесса (используем Get-CimInstance для доступа к CommandLine)
    try {
        Get-CimInstance Win32_Process | Where-Object {
            $_.CommandLine -like "*backend/main.py*"
        } | ForEach-Object {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Info "Остановлен backend процесс (PID: $($_.ProcessId))"
        }
    } catch {
        Write-Info "Не удалось проверить процессы backend"
    }

    try {
        Get-CimInstance Win32_Process | Where-Object {
            $_.CommandLine -like "*frontend*" -and $_.CommandLine -like "*vite*" -and $_.ProcessName -eq "node.exe"
        } | ForEach-Object {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Info "Остановлен frontend процесс (PID: $($_.ProcessId))"
        }
    } catch {
        Write-Info "Не удалось проверить процессы frontend"
    }

    Start-Sleep -Seconds 1
}

# ============================================================================
# ОСНОВНОЙ СЦЕНАРИЙ
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "   CGM Dashboard - Запуск проекта      " -ForegroundColor $ColorInfo
Write-Host "   Госзакупки CGM - Дашборд аналитики  " -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo

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
    Write-Host '    & "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\pg_data"'
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

    # Создаём отдельные файлы для stdout и stderr
    $backendLogStdout = Join-Path $LogDir "backend_stdout_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    $backendLogStderr = Join-Path $LogDir "backend_stderr_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

    # Запуск backend в фоновом режиме
    $process = Start-Process python `
        -ArgumentList $backendArgs `
        -WorkingDirectory $BackendDir `
        -PassThru `
        -RedirectStandardOutput $backendLogStdout `
        -RedirectStandardError $backendLogStderr `
        -WindowStyle Hidden

    $backendPid = $process.Id
    Write-Info "Backend запущен с PID: $backendPid"
    Write-Info "Лог stdout: $backendLogStdout"
    Write-Info "Лог stderr: $backendLogStderr"
    
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
$frontendMapPid = 0
$frontendComparePid = 0

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

    # -----------------------------------------------------------------------------
    # Шаг 7б: Запуск Frontend Map (Карта регионов)
    # -----------------------------------------------------------------------------
    Write-Step "Шаг 7б: Запуск Frontend Map (Карта регионов)"

    # Проверка наличия директории frontend_map
    if (Test-Path $FrontendMapDir) {
        $frontendMapLog = Join-Path $LogDir "frontend_map_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

        # Проверка наличия package.json
        if (Test-Path (Join-Path $FrontendMapDir "package.json")) {
            # Проверка node_modules
            $nodeModulesMap = Join-Path $FrontendMapDir "node_modules"
            if (!(Test-Path $nodeModulesMap)) {
                Write-Warning-Custom "node_modules не найден в frontend_map. Установка зависимостей..."
                Set-Location $FrontendMapDir
                npm install
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Frontend Map зависимости установлены"
                } else {
                    Write-Error-Custom "Ошибка установки зависимостей frontend_map"
                }
                Set-Location $ScriptDir
            }

            # Запуск frontend_map в фоновом режиме
            $process = Start-Process npm `
                -ArgumentList "run", "dev" `
                -WorkingDirectory $FrontendMapDir `
                -PassThru `
                -WindowStyle Hidden

            $frontendMapPid = $process.Id
            Write-Info "Frontend Map запущен с PID: $frontendMapPid"

            # Ожидание запуска frontend_map
            Write-Info "Ожидание запуска frontend_map (до 10 секунд)..."
            $maxAttempts = 20
            $attempt = 0
            $frontendMapReady = $false

            while ($attempt -lt $maxAttempts) {
                Start-Sleep -Milliseconds 500
                try {
                    $response = Invoke-RestMethod -Uri "http://localhost:5174" -Method Get -ErrorAction Stop
                    $frontendMapReady = $true
                    break
                } catch {
                    $attempt++
                }
            }

            if ($frontendMapReady) {
                Write-Success "Frontend Map запущен: http://localhost:5174"
            } else {
                Write-Warning-Custom "Frontend Map может запускаться дольше обычного"
            }
        } else {
            Write-Warning-Custom "frontend_map: package.json не найден, пропускаем"
        }
    } else {
        Write-Info "frontend_map: директория не найдена, пропускаем"
    }

    # -----------------------------------------------------------------------------
    # Шаг 7в: Запуск Frontend Compare (Сравнение периодов)
    # -----------------------------------------------------------------------------
    Write-Step "Шаг 7в: Запуск Frontend Compare (Сравнение периодов)"

    # Проверка наличия директории frontend_compare
    if (Test-Path $FrontendCompareDir) {
        $frontendCompareLog = Join-Path $LogDir "frontend_compare_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

        # Проверка наличия package.json
        if (Test-Path (Join-Path $FrontendCompareDir "package.json")) {
            # Проверка node_modules
            $nodeModulesCompare = Join-Path $FrontendCompareDir "node_modules"
            if (!(Test-Path $nodeModulesCompare)) {
                Write-Warning-Custom "node_modules не найден в frontend_compare. Установка зависимостей..."
                Set-Location $FrontendCompareDir
                npm install
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Frontend Compare зависимости установлены"
                } else {
                    Write-Error-Custom "Ошибка установки зависимостей frontend_compare"
                }
                Set-Location $ScriptDir
            }

            # Запуск frontend_compare в фоновом режиме
            $process = Start-Process npm `
                -ArgumentList "run", "dev" `
                -WorkingDirectory $FrontendCompareDir `
                -PassThru `
                -WindowStyle Hidden

            $frontendComparePid = $process.Id
            Write-Info "Frontend Compare запущен с PID: $frontendComparePid"

            # Ожидание запуска frontend_compare
            Write-Info "Ожидание запуска frontend_compare (до 10 секунд)..."
            $maxAttempts = 20
            $attempt = 0
            $frontendCompareReady = $false

            while ($attempt -lt $maxAttempts) {
                Start-Sleep -Milliseconds 500
                try {
                    $response = Invoke-RestMethod -Uri "http://localhost:5175" -Method Get -ErrorAction Stop
                    $frontendCompareReady = $true
                    break
                } catch {
                    $attempt++
                }
            }

            if ($frontendCompareReady) {
                Write-Success "Frontend Compare запущен: http://localhost:5175"
            } else {
                Write-Warning-Custom "Frontend Compare может запускаться дольше обычного"
            }
        } else {
            Write-Warning-Custom "frontend_compare: package.json не найден, пропускаем"
        }
    } else {
        Write-Info "frontend_compare: директория не найдена, пропускаем"
    }
}

# -----------------------------------------------------------------------------
# Шаг 8: Сохранение PID и завершение
# -----------------------------------------------------------------------------
Write-Step "Шаг 8: Завершение"

Save-Pid -BackendPid $backendPid -FrontendPid $frontendPid -FrontendMapPid $frontendMapPid -FrontendComparePid $frontendComparePid
Write-Success "PID процессов сохранены в .pids.json"

Write-Host ""
Write-Host "========================================" -ForegroundColor $ColorSuccess
Write-Host "    ПРОЕКТ УСПЕШНО ЗАПУЩЕН!            " -ForegroundColor $ColorSuccess
Write-Host "========================================" -ForegroundColor $ColorSuccess
if (!$NoBackend) {
    Write-Host "  Backend API:    http://localhost:8000" -ForegroundColor $ColorInfo
    Write-Host "  Swagger:        http://localhost:8000/docs" -ForegroundColor $ColorInfo
}
if (!$NoFrontend) {
    Write-Host "  Frontend:         http://localhost:5173" -ForegroundColor $ColorInfo
    Write-Host "  Frontend Map:     http://localhost:5174" -ForegroundColor $ColorInfo
    Write-Host "  Frontend Compare: http://localhost:5175" -ForegroundColor $ColorInfo
}
Write-Host "========================================" -ForegroundColor $ColorSuccess
Write-Host "  Для остановки выполните: .\stop_project.ps1" -ForegroundColor $ColorWarning
Write-Host "========================================" -ForegroundColor $ColorSuccess
Write-Host ""


