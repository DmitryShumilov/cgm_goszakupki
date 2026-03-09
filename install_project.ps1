<#
.SYNOPSIS
    Скрипт установки зависимостей CGM Dashboard.
    
.DESCRIPTION
    Автоматически устанавливает все зависимости проекта:
    - Python зависимости для backend
    - Node.js зависимости для frontend
    Проверяет наличие необходимых инструментов и создаёт .env файл.
    
.PARAMETER Force
    Принудительная переустановка зависимостей.
    
.PARAMETER BackendOnly
    Установить только backend зависимости.
    
.PARAMETER FrontendOnly
    Установить только frontend зависимости.
    
.EXAMPLE
    .\install_project.ps1
    Полная установка всех зависимостей
    
.EXAMPLE
    .\install_project.ps1 -BackendOnly
    Установка только backend зависимостей
    
.EXAMPLE
    .\install_project.ps1 -Force
    Принудительная переустановка
    
.NOTES
    Version: 1.0.0
    Author: CGM Dashboard Team
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

# ============================================================================
# КОНФИГУРАЦИЯ
# ============================================================================
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$FrontendDir = Join-Path $ScriptDir "frontend"
$EnvFile = Join-Path $ScriptDir ".env"
$EnvExample = Join-Path $ScriptDir ".env.example"
$LogDir = Join-Path $ScriptDir "logs"

# Цвета вывода
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorWarning = "Yellow"
$ColorInfo = "Cyan"
$ColorStep = "Magenta"
$ColorHeader = "White"

# ============================================================================
# ФУНКЦИИ
# ============================================================================

function Write-Header {
    param([string]$Message)
    Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor $ColorHeader
    Write-Host "║  $Message" -ForegroundColor $ColorHeader
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $ColorHeader
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n───────────────────────────────────────────────────────────" -ForegroundColor $ColorStep
    Write-Host "  $Message" -ForegroundColor $ColorStep
    Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor $ColorStep
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

function Test-Npm {
    try {
        $version = npm --version 2>&1
        return $true, $version
    } catch {
        return $false, "npm not found"
    }
}

function Install-Pip-Packages {
    param(
        [string]$RequirementsFile,
        [switch]$Upgrade
    )
    
    $args = @("install", "-r", $RequirementsFile)
    if ($Upgrade) {
        $args = @("install", "--upgrade", "-r", $RequirementsFile)
    }
    if ($Force) {
        $args += "--force-reinstall"
    }
    
    Write-Info "Выполнение: pip $($args -join ' ')"
    & pip @args
    
    if ($LASTEXITCODE -eq 0) {
        return $true
    } else {
        return $false
    }
}

function Install-Npm-Packages {
    param(
        [string]$Directory
    )
    
    $oldLocation = Get-Location
    Set-Location $Directory
    
    Write-Info "Выполнение: npm install"
    npm install
    
    $exitCode = $LASTEXITCODE
    Set-Location $oldLocation
    
    if ($exitCode -eq 0) {
        return $true
    } else {
        return $false
    }
}

# ============================================================================
# ОСНОВНОЙ СЦЕНАРИЙ
# ============================================================================

Write-Header "CGM Dashboard - Установка зависимостей"

$InstallStatus = @{
    Backend = "SKIPPED"
    Frontend = "SKIPPED"
    EnvFile = "SKIPPED"
}

# -----------------------------------------------------------------------------
# Шаг 1: Проверка системных требований
# -----------------------------------------------------------------------------
Write-Step "Шаг 1: Проверка системных требований"

# Python
$pythonOk, $pythonVersion = Test-Python
if ($pythonOk) {
    Write-Success "Python: $pythonVersion"
} else {
    Write-Error-Custom "Python не найден"
    Write-Info "Установите Python 3.14+ с https://www.python.org/downloads/"
    Write-Info "При установке отметьте галочку 'Add Python to PATH'"
    exit 1
}

# Node.js (если не BackendOnly)
if (!$BackendOnly) {
    $nodeOk, $nodeVersion = Test-Node
    if ($nodeOk) {
        Write-Success "Node.js: $nodeVersion"
    } else {
        Write-Error-Custom "Node.js не найден"
        Write-Info "Установите Node.js 18+ с https://nodejs.org/"
        exit 1
    }
    
    # npm
    $npmOk, $npmVersion = Test-Npm
    if ($npmOk) {
        Write-Success "npm: v$npmVersion"
    } else {
        Write-Error-Custom "npm не найден"
        exit 1
    }
}

# -----------------------------------------------------------------------------
# Шаг 2: Создание .env файла
# -----------------------------------------------------------------------------
Write-Step "Шаг 2: Проверка .env файла"

if (Test-Path $EnvFile) {
    Write-Success ".env файл уже существует"
    $InstallStatus.EnvFile = "EXISTS"
    
    if ($Force) {
        Write-Warning-Custom ".env файл будет перезаписан"
        $confirmation = Read-Host "Перезаписать .env? [y/N]"
        if ($confirmation -eq "y" -or $confirmation -eq "Y") {
            Copy-Item $EnvExample -Destination $EnvFile -Force
            Write-Success ".env файл создан из .env.example"
            Write-Warning-Custom "Не забудьте указать правильный POSTGRES_PASSWORD в .env!"
            $InstallStatus.EnvFile = "RECREATED"
        }
    }
} else {
    if (Test-Path $EnvExample) {
        Copy-Item $EnvExample -Destination $EnvFile
        Write-Success ".env файл создан из .env.example"
        Write-Warning-Custom "ОТКРОЙТЕ .env И УКАЖИТЕ POSTGRES_PASSWORD!"
        $InstallStatus.EnvFile = "CREATED"
        
        # Предложение отредактировать
        Write-Info "Открыть .env для редактирования?"
        $edit = Read-Host "Открыть .env в блокноте? [Y/n]"
        if ($edit -ne "n" -and $edit -ne "N") {
            notepad $EnvFile
        }
    } else {
        Write-Warning-Custom ".env.example не найден. Создаём базовый .env"
        $content = @"
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DATABASE=cgm_dashboard

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80

# Backend Port
BACKEND_PORT=8000

# Frontend Port
FRONTEND_PORT=80
"@
        Set-Content -Path $EnvFile -Value $content -Encoding UTF8
        Write-Success "Базовый .env файл создан"
        Write-Warning-Custom "ОТКРОЙТЕ .env И УКАЖИТЕ POSTGRES_PASSWORD!"
        $InstallStatus.EnvFile = "CREATED_BASIC"
    }
}

# -----------------------------------------------------------------------------
# Шаг 3: Создание директории логов
# -----------------------------------------------------------------------------
Write-Step "Шаг 3: Создание директорий"

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
    Write-Success "Директория logs создана"
} else {
    Write-Success "Директория logs существует"
}

# -----------------------------------------------------------------------------
# Шаг 4: Установка backend зависимостей
# -----------------------------------------------------------------------------
$installBackend = !$FrontendOnly
$backendReq = Join-Path $BackendDir "requirements.txt"

if ($installBackend) {
    Write-Step "Шаг 4: Установка backend зависимостей"
    
    if (Test-Path $backendReq) {
        Write-Success "requirements.txt найден"
        
        # Проверка текущих установленных пакетов
        if (!$Force) {
            $fastapiInstalled = pip show fastapi 2>&1
            if ($fastapiInstalled -like "*fastapi*") {
                Write-Info "Backend зависимости уже установлены"
                Write-Info "Для переустановки используйте -Force"
                $reinstall = Read-Host "Переустановить зависимости? [y/N]"
                if ($reinstall -eq "y" -or $reinstall -eq "Y") {
                    $Force = $true
                }
            }
        }
        
        # Установка
        Write-Info "Установка Python зависимостей..."
        $installResult = Install-Pip-Packages -RequirementsFile $backendReq -Upgrade:$Force
        
        if ($installResult) {
            Write-Success "Backend зависимости установлены"
            $InstallStatus.Backend = "INSTALLED"
            
            # Проверка ключевых пакетов
            Write-Info "Проверка установленных пакетов:"
            $keyPackages = @("fastapi", "uvicorn", "psycopg2-binary", "pydantic", "slowapi")
            foreach ($pkg in $keyPackages) {
                $pkgInfo = pip show $pkg 2>&1
                if ($pkgInfo -like "*$pkg*") {
                    $version = ($pkgInfo | Select-String "Version:" | ForEach-Object { ($_ -split ":", 2)[1].Trim() })
                    Write-Success "$pkg v$version"
                }
            }
        } else {
            Write-Error-Custom "Ошибка установки backend зависимостей"
            Write-Info "Попробуйте выполнить вручную:"
            Write-Info "  pip install -r backend/requirements.txt"
            $InstallStatus.Backend = "FAILED"
        }
    } else {
        Write-Error-Custom "requirements.txt не найден в backend/"
        $InstallStatus.Backend = "FAILED"
    }
}

# -----------------------------------------------------------------------------
# Шаг 5: Установка frontend зависимостей
# -----------------------------------------------------------------------------
$installFrontend = !$BackendOnly

if ($installFrontend) {
    Write-Step "Шаг 5: Установка frontend зависимостей"
    
    $packageJson = Join-Path $FrontendDir "package.json"
    $nodeModules = Join-Path $FrontendDir "node_modules"
    
    if (Test-Path $packageJson) {
        Write-Success "package.json найден"
        
        # Проверка node_modules
        if ((Test-Path $nodeModules) -and !$Force) {
            Write-Info "node_modules уже существует"
            Write-Info "Для переустановки используйте -Force"
            $reinstall = Read-Host "Переустановить зависимости? [y/N]"
            if ($reinstall -eq "y" -or $reinstall -eq "Y") {
                Write-Info "Удаление node_modules..."
                Remove-Item $nodeModules -Recurse -Force
                Write-Success "node_modules удалён"
            } else {
                Write-Success "Frontend зависимости уже установлены"
                $InstallStatus.Frontend = "INSTALLED"
            }
        }
        
        if (!(Test-Path $nodeModules) -or $Force) {
            # Установка
            Write-Info "Установка Node.js зависимостей..."
            Write-Info "Это может занять несколько минут..."
            
            $installResult = Install-Npm-Packages -Directory $FrontendDir
            
            if ($installResult) {
                Write-Success "Frontend зависимости установлены"
                $InstallStatus.Frontend = "INSTALLED"
                
                # Проверка ключевых пакетов
                Write-Info "Проверка установленных пакетов:"
                $keyNpmPackages = @("react", "vite", "@mui/material", "recharts", "axios")
                foreach ($pkg in $keyNpmPackages) {
                    $pkgPath = Join-Path $nodeModules $pkg "package.json"
                    if (Test-Path $pkgPath) {
                        $pkgData = Get-Content $pkgPath | ConvertFrom-Json
                        Write-Success "$pkg v$($pkgData.version)"
                    }
                }
            } else {
                Write-Error-Custom "Ошибка установки frontend зависимостей"
                Write-Info "Попробуйте выполнить вручную:"
                Write-Info "  cd frontend && npm install"
                $InstallStatus.Frontend = "FAILED"
            }
        }
    } else {
        Write-Error-Custom "package.json не найден в frontend/"
        $InstallStatus.Frontend = "FAILED"
    }
}

# -----------------------------------------------------------------------------
# Шаг 6: Итоговый отчёт
# -----------------------------------------------------------------------------
Write-Header "Итоговый отчёт"

Write-Host "`n  Установка зависимостей завершена!" -ForegroundColor $ColorHeader

Write-Host "`n  Статус компонентов:" -ForegroundColor $ColorInfo
Write-Host "    .env файл:      $($InstallStatus.EnvFile)" -ForegroundColor $(
    if ($InstallStatus.EnvFile -like "*CREATED*" -or $InstallStatus.EnvFile -eq "EXISTS") { $ColorSuccess } 
    else { $ColorWarning }
)
Write-Host "    Backend:        $($InstallStatus.Backend)" -ForegroundColor $(
    if ($InstallStatus.Backend -eq "INSTALLED") { $ColorSuccess } 
    elseif ($InstallStatus.Backend -eq "FAILED") { $ColorError }
    else { $ColorInfo }
)
Write-Host "    Frontend:       $($InstallStatus.Frontend)" -ForegroundColor $(
    if ($InstallStatus.Frontend -eq "INSTALLED") { $ColorSuccess } 
    elseif ($InstallStatus.Frontend -eq "FAILED") { $ColorError }
    else { $ColorInfo }
)

Write-Host "`n"
$allOk = ($InstallStatus.Backend -ne "FAILED") -and ($InstallStatus.Frontend -ne "FAILED")

if ($allOk) {
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $ColorSuccess
    Write-Host "║  ЗАВИСИМОСТИ УСТАНОВЛЕНЫ!                                ║" -ForegroundColor $ColorSuccess
    Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor $ColorSuccess
    
    if ($InstallStatus.EnvFile -like "*CREATED*") {
        Write-Host "║  1. ОТКРОЙТЕ .env И УКАЖИТЕ POSTGRES_PASSWORD!         ║" -ForegroundColor $ColorWarning
        Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor $ColorSuccess
    }
    
    Write-Host "║  2. Проверьте проект: .\check_project.ps1                ║" -ForegroundColor $ColorInfo
    Write-Host "║  3. Запустите проект: .\start_project.ps1                ║" -ForegroundColor $ColorInfo
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $ColorSuccess
} else {
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $ColorError
    Write-Host "║  УСТАНОВКА ЗАВЕРШИЛАСЬ С ОШИБКАМИ                        ║" -ForegroundColor $ColorError
    Write-Host "╠══════════════════════════════════════════════════════════╣" -ForegroundColor $ColorError
    Write-Host "║  Проверьте сообщения выше и попробуйте снова             ║" -ForegroundColor $ColorWarning
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $ColorError
}

Write-Host "`n"

# Выходной код
if ($allOk) {
    exit 0
} else {
    exit 1
}
