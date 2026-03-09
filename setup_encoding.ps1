<#
.SYNOPSIS
    Автоматическая настройка UTF-8 кодировки для PowerShell проекта.
.DESCRIPTION
    Конвертирует все .ps1 файлы в UTF-8 с BOM и настраивает профиль PowerShell.
.EXAMPLE
    .\setup_encoding.ps1
.NOTES
    Version: 1.0.0
#>

Write-Host "=== PowerShell UTF-8 Setup ===" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Конвертация .ps1 файлов
Write-Host "[1/3] Converting .ps1 files to UTF-8 with BOM..." -ForegroundColor Yellow

$files = @('start_project.ps1', 'stop_project.ps1', 'install_project.ps1', 'check_project.ps1')
foreach ($f in $files) {
    if (Test-Path $f) {
        $content = Get-Content -Path $f -Raw -Encoding UTF8
        $utf8BOM = New-Object System.Text.UTF8Encoding $true
        [System.IO.File]::WriteAllText("$PWD\$f", $content, $utf8BOM)
        Write-Host "  [OK] $f" -ForegroundColor Green
    }
}

# Шаг 2: Создание .editorconfig
Write-Host ""
Write-Host "[2/3] Creating .editorconfig..." -ForegroundColor Yellow

$editorconfig = @"
root = true

[*]
charset = utf-8
end_of_line = crlf
insert_final_newline = true
trim_trailing_whitespace = true

[*.ps1]
charset = utf-8-bom
indent_style = space
indent_size = 4

[*.py]
charset = utf-8
indent_style = space
indent_size = 4

[*.md]
charset = utf-8
trim_trailing_whitespace = false

[*.json]
charset = utf-8
indent_style = space
indent_size = 2
"@

$editorconfig | Out-File -FilePath ".editorconfig" -Encoding UTF8
Write-Host "  [OK] .editorconfig created" -ForegroundColor Green

# Шаг 3: Инструкция по настройке профиля
Write-Host ""
Write-Host "[3/3] PowerShell profile setup instructions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Add the following to your PowerShell profile:" -ForegroundColor Cyan
Write-Host "  notepad `$PROFILE" -ForegroundColor White
Write-Host ""
Write-Host "--- Copy this to your profile ---" -ForegroundColor Yellow
Write-Host ""
Write-Host '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8' -ForegroundColor White
Write-Host '[Console]::InputEncoding = [System.Text.Encoding]::UTF8' -ForegroundColor White
Write-Host '$PSDefaultParameterValues["Out-File:Encoding"] = "utf8"' -ForegroundColor White
Write-Host '$PSDefaultParameterValues["Set-Content:Encoding"] = "utf8"' -ForegroundColor White
Write-Host '$PSDefaultParameterValues["Get-Content:Encoding"] = "utf8"' -ForegroundColor White
Write-Host 'chcp 65001 | Out-Null' -ForegroundColor White
Write-Host ""
Write-Host "---------------------------------" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: notepad `$PROFILE" -ForegroundColor White
Write-Host "  2. Add the lines shown above" -ForegroundColor White
Write-Host "  3. Restart PowerShell" -ForegroundColor White
Write-Host "  4. Test: .\test_encoding.ps1" -ForegroundColor White
Write-Host ""
