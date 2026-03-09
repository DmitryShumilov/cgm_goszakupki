<#
.SYNOPSIS
    Скрипт остановки CGM Dashboard проекта.
    
.DESCRIPTION
    Корректно останавливает backend (FastAPI) и frontend (React/Vite) серверы.
    Очищает PID файл и завершает процессы.
    
.PARAMETER Force
    Принудительная остановка без подтверждения.
    
.EXAMPLE
    .\stop_project.ps1
    Остановка всех серверов проекта
    
.EXAMPLE
    .\stop_project.ps1 -Force
    Принудительная остановка без подтверждения
    
.NOTES
    Version: 1.0.0
    Author: CGM Dashboard Team
#>

[CmdletBinding()]
param(
    [switch]$Force
)

# ============================================================================
# КОНФИГУРАЦИЯ
# ============================================================================
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
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

function Stop-Process-By-Name {
    param(
        [string]$ProcessName,
        [string]$CommandLinePattern
    )
    
    $processes = Get-Process | Where-Object { 
        $_.ProcessName -eq $ProcessName
    }
    
    foreach ($proc in $processes) {
        try {
            # Получаем командную строку процесса
            $wmi = Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
            if ($wmi -and $wmi.CommandLine -like "*$CommandLinePattern*") {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Info "Остановлен процесс $($proc.Name) (PID: $($proc.Id))"
            }
        } catch {
            # Игнорируем ошибки доступа к некоторым процессам
        }
    }
}

# ============================================================================
# ОСНОВНОЙ СЦЕНАРИЙ
# ============================================================================

Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $ColorWarning
Write-Host "║       CGM Dashboard - Остановка проекта                  ║" -ForegroundColor $ColorWarning
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $ColorWarning

# -----------------------------------------------------------------------------
# Шаг 1: Проверка PID файла
# -----------------------------------------------------------------------------
Write-Step "Шаг 1: Чтение сохранённых процессов"

$backendStopped = $false
$frontendStopped = $false

if (Test-Path $PidFile) {
    try {
        $pids = Get-Content $PidFile | ConvertFrom-Json
        
        if ($pids.backend) {
            Write-Info "Backend PID: $($pids.backend)"
            try {
                $process = Get-Process -Id $pids.backend -ErrorAction Stop
                if (!$Force) {
                    $confirmation = Read-Host "Остановить backend (PID: $($pids.backend))? [Y/n]"
                    if ($confirmation -eq "n" -or $confirmation -eq "N") {
                        Write-Info "Пропущена остановка backend"
                    } else {
                        Stop-Process -Id $pids.backend -Force -ErrorAction SilentlyContinue
                        $backendStopped = $true
                        Write-Success "Backend остановлен"
                    }
                } else {
                    Stop-Process -Id $pids.backend -Force -ErrorAction SilentlyContinue
                    $backendStopped = $true
                    Write-Success "Backend остановлен (принудительно)"
                }
            } catch {
                Write-Info "Backend уже не запущен"
                $backendStopped = $true
            }
        }
        
        if ($pids.frontend) {
            Write-Info "Frontend PID: $($pids.frontend)"
            try {
                $process = Get-Process -Id $pids.frontend -ErrorAction Stop
                if (!$Force) {
                    $confirmation = Read-Host "Остановить frontend (PID: $($pids.frontend))? [Y/n]"
                    if ($confirmation -eq "n" -or $confirmation -eq "N") {
                        Write-Info "Пропущена остановка frontend"
                    } else {
                        Stop-Process -Id $pids.frontend -Force -ErrorAction SilentlyContinue
                        $frontendStopped = $true
                        Write-Success "Frontend остановлен"
                    }
                } else {
                    Stop-Process -Id $pids.frontend -Force -ErrorAction SilentlyContinue
                    $frontendStopped = $true
                    Write-Success "Frontend остановлен (принудительно)"
                }
            } catch {
                Write-Info "Frontend уже не запущен"
                $frontendStopped = $true
            }
        }
        
        # Удаление PID файла
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        Write-Success "PID файл удалён"
        
    } catch {
        Write-Warning-Custom "Ошибка чтения PID файла: $_"
    }
} else {
    Write-Info "PID файл не найден. Поиск процессов по имени..."
}

# -----------------------------------------------------------------------------
# Шаг 2: Остановка по имени процесса
# -----------------------------------------------------------------------------
Write-Step "Шаг 2: Поиск и остановка процессов по имени"

# Остановка backend (python + main.py)
Write-Info "Поиск процессов backend..."
$backendProcesses = Get-Process | Where-Object { 
    $_.ProcessName -eq "python" -or $_.ProcessName -eq "pythonw"
}

foreach ($proc in $backendProcesses) {
    try {
        $wmi = Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
        if ($wmi -and $wmi.CommandLine -like "*main.py*") {
            if (!$Force) {
                $confirmation = Read-Host "Остановить backend процесс (PID: $($proc.Id))? [Y/n]"
                if ($confirmation -ne "n" -and $confirmation -ne "N") {
                    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                    Write-Success "Backend процесс остановлен (PID: $($proc.Id))"
                }
            } else {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Success "Backend процесс остановлен (PID: $($proc.Id))"
            }
        }
    } catch {
        # Игнорируем ошибки
    }
}

# Остановка frontend (node + vite)
Write-Info "Поиск процессов frontend..."
$frontendProcesses = Get-Process | Where-Object { 
    $_.ProcessName -eq "node"
}

foreach ($proc in $frontendProcesses) {
    try {
        $wmi = Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
        if ($wmi -and $wmi.CommandLine -like "*vite*") {
            if (!$Force) {
                $confirmation = Read-Host "Остановить frontend процесс (PID: $($proc.Id))? [Y/n]"
                if ($confirmation -ne "n" -and $confirmation -ne "N") {
                    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                    Write-Success "Frontend процесс остановлен (PID: $($proc.Id))"
                }
            } else {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Success "Frontend процесс остановлен (PID: $($proc.Id))"
            }
        }
    } catch {
        # Игнорируем ошибки
    }
}

# -----------------------------------------------------------------------------
# Шаг 3: Проверка портов
# -----------------------------------------------------------------------------
Write-Step "Шаг 3: Проверка освобождения портов"

Start-Sleep -Seconds 2

# Проверка порта 8000 (backend)
$backendPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Warning-Custom "Порт 8000 всё ещё занят. Backend может завершаться."
} else {
    Write-Success "Порт 8000 свободен"
}

# Проверка порта 5173 (frontend)
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendPort) {
    Write-Warning-Custom "Порт 5173 всё ещё занят. Frontend может завершаться."
} else {
    Write-Success "Порт 5173 свободен"
}

# -----------------------------------------------------------------------------
# Шаг 4: Завершение
# -----------------------------------------------------------------------------
Write-Step "Шаг 4: Завершение"

Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $ColorSuccess
Write-Host "║              ПРОЕКТ ОСТАНОВЛЕН                           ║" -ForegroundColor $ColorSuccess
Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor $ColorSuccess
Write-Host "║  Для запуска выполните: .\start_project.ps1              ║" -ForegroundColor $ColorInfo
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $ColorSuccess
Write-Host "`n"
