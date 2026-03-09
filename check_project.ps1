<#
.SYNOPSIS
    CGM Dashboard Project Health Check Script
.DESCRIPTION
    Checks all project components and dependencies
.EXAMPLE
    .\check_project.ps1
.NOTES
    Version: 1.0.2
#>

[CmdletBinding()]
param(
    [switch]$Quick,
    [switch]$Json
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$FrontendDir = Join-Path $ScriptDir "frontend"
$EnvFile = Join-Path $ScriptDir ".env"

$Stats = @{ Passed = 0; Failed = 0; Warnings = 0 }
$OverallStatus = "OK"

# Functions
function Write-Section { param([string]$M); Write-Host "`n--- $M ---" -ForegroundColor Magenta }
function Write-Pass { param([string]$M); Write-Host "  [OK] $M" -ForegroundColor Green; $script:Stats.Passed++ }
function Write-Fail { param([string]$M); Write-Host "  [FAIL] $M" -ForegroundColor Red; $script:Stats.Failed++ }
function Write-Warn { param([string]$M); Write-Host "  [WARN] $M" -ForegroundColor Yellow; $script:Stats.Warnings++ }
function Write-Info { param([string]$M); Write-Host "  [INFO] $M" -ForegroundColor Cyan }

function Get-EnvValue {
    param([string]$Key)
    if (Test-Path $EnvFile) {
        $line = Get-Content $EnvFile | Select-String "^$Key="
        if ($line) { return ($line -split "=", 2)[1] }
    }
    return $null
}

# MAIN
Write-Host "`n=== CGM Dashboard - Project Health Check ===`n"

# Section 1: .env file
Write-Section "1. Configuration (.env)"
if (Test-Path $EnvFile) {
    Write-Pass ".env file found"
    $requiredVars = @("POSTGRES_HOST", "POSTGRES_PORT", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DATABASE")
    foreach ($var in $requiredVars) {
        $value = Get-EnvValue $var
        if ($value) {
            if ($var -like "*PASSWORD*") { Write-Pass "$var = *** (set)" }
            else { Write-Pass "$var = $value" }
        } else {
            Write-Fail "$var not set"
            $OverallStatus = "FAIL"
        }
    }
} else {
    Write-Fail ".env file not found"
    Write-Info "Copy .env.example to .env and configure"
    $OverallStatus = "FAIL"
}

# Section 2: System dependencies
Write-Section "2. System Dependencies"

try {
    $pythonVersion = python --version 2>&1
    Write-Pass "Python: $pythonVersion"
} catch {
    Write-Fail "Python not found"
    $OverallStatus = "FAIL"
}

try {
    $nodeVersion = node --version 2>&1
    Write-Pass "Node.js: $nodeVersion"
} catch {
    Write-Fail "Node.js not found"
    $OverallStatus = "FAIL"
}

try {
    $npmVersion = npm --version 2>&1
    Write-Pass "npm: v$npmVersion"
} catch {
    Write-Fail "npm not found"
    $OverallStatus = "FAIL"
}

# Section 3: PostgreSQL
Write-Section "3. Database (PostgreSQL)"

$postgresPassword = Get-EnvValue "POSTGRES_PASSWORD"
$postgresDatabase = Get-EnvValue "POSTGRES_DATABASE"

if ($postgresPassword) {
    $env:PGPASSWORD = $postgresPassword
    try {
        $result = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d $postgresDatabase -c "SELECT 1" 2>&1
        if ($result -like "*row*" -or $result -notlike "*error*") {
            Write-Pass "PostgreSQL: connected to $postgresDatabase"
            try {
                $result2 = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d $postgresDatabase -c "SELECT COUNT(*) FROM purchases" 2>&1
                if ($result2 -match "(\d+)") {
                    Write-Pass "Table purchases: $($Matches[1]) records"
                }
            } catch { Write-Info "Could not check purchases table" }
        } else {
            Write-Fail "PostgreSQL: connection error"
            $OverallStatus = "FAIL"
        }
    } catch {
        Write-Fail "PostgreSQL not available"
        $OverallStatus = "FAIL"
    }
} else {
    Write-Fail "POSTGRES_PASSWORD not set"
    $OverallStatus = "FAIL"
}

# Section 4: Backend dependencies
Write-Section "4. Backend Dependencies (Python)"

$backendReq = Join-Path $BackendDir "requirements.txt"
if (Test-Path $backendReq) {
    Write-Pass "requirements.txt found"
    $requiredPackages = @("fastapi", "uvicorn", "psycopg2-binary", "pydantic", "slowapi")
    foreach ($pkg in $requiredPackages) {
        $result = pip show $pkg 2>&1
        if ($result -like "*$pkg*") {
            $versionLine = $result | Select-String "Version:"
            if ($versionLine) {
                $version = ($versionLine -split ":")[1].Trim()
                Write-Pass "${pkg}: v${version}"
            }
        } else {
            Write-Fail "${pkg} not installed"
        }
    }
} else {
    Write-Fail "requirements.txt not found"
    $OverallStatus = "FAIL"
}

$mainPy = Join-Path $BackendDir "main.py"
if (Test-Path $mainPy) { Write-Pass "main.py found" }
else {
    Write-Fail "main.py not found"
    $OverallStatus = "FAIL"
}

# Section 5: Frontend dependencies
Write-Section "5. Frontend Dependencies (Node.js)"

$packageJson = Join-Path $FrontendDir "package.json"
$nodeModules = Join-Path $FrontendDir "node_modules"

if (Test-Path $packageJson) { Write-Pass "package.json found" }
else {
    Write-Fail "package.json not found"
    $OverallStatus = "FAIL"
}

if (Test-Path $nodeModules) {
    Write-Pass "node_modules found"
    $requiredNpmPackages = @("react", "vite", "@mui/material", "recharts", "axios")
    foreach ($pkg in $requiredNpmPackages) {
        $pkgPath = Join-Path $nodeModules $pkg
        if (Test-Path $pkgPath) { Write-Pass "${pkg}: installed" }
        else { Write-Fail "${pkg} not installed" }
    }
} else {
    Write-Warn "node_modules not found"
    Write-Info "Run: cd frontend && npm install"
}

$mainTsx = Join-Path $FrontendDir "src\main.tsx"
if (Test-Path $mainTsx) { Write-Pass "main.tsx found" }
else {
    Write-Fail "main.tsx not found"
    $OverallStatus = "FAIL"
}

# Section 6: Running services
if (!$Quick) {
    Write-Section "6. Running Services"
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -ErrorAction Stop
        Write-Pass "Backend API: running (status: $($response.status))"
    } catch { Write-Info "Backend API: not running" }
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5173" -Method Get -ErrorAction Stop
        Write-Pass "Frontend: running"
    } catch { Write-Info "Frontend: not running" }
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/docs" -Method Get -ErrorAction Stop
        Write-Pass "Swagger UI: available"
    } catch { Write-Info "Swagger UI: not available" }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor White
Write-Host "  Total checks: $($Stats.Passed + $Stats.Failed + $Stats.Warnings)"
Write-Host "  [OK] Passed: $($Stats.Passed)" -ForegroundColor Green
Write-Host "  [FAIL] Failed: $($Stats.Failed)" -ForegroundColor Red
Write-Host "  [WARN] Warnings: $($Stats.Warnings)" -ForegroundColor Yellow

if ($OverallStatus -eq "OK" -and $Stats.Failed -eq 0) {
    Write-Host "`n[SUCCESS] All checks passed! Project is ready to run." -ForegroundColor Green
    Write-Host "  Run: .\start_project.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`n[ERROR] Issues detected! Fix errors before running." -ForegroundColor Red
}

Write-Host ""

if ($Json) { $Stats | ConvertTo-Json -Depth 3 }
if ($Stats.Failed -gt 0) { exit 1 } else { exit 0 }
