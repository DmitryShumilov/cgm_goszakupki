# PowerShell Profile - Universal Settings
# Applies to all PowerShell sessions (all projects)

# ============================================================================
# UTF-8 Encoding (for correct Cyrillic and special characters display)
# ============================================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Get-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'

# Set console code page to UTF-8 (65001)
chcp 65001 | Out-Null

# ============================================================================
# Python UTF-8 Support (for scripts with Cyrillic output)
# ============================================================================
$env:PYTHONIOENCODING = 'utf-8'

# ============================================================================
# Useful Aliases (Linux-like commands)
# ============================================================================
Set-Alias -Name grep -Value Select-String -Force
Set-Alias -Name ll -Value Get-ChildItem -Force

# ============================================================================
# Greeting (optional - remove if you don't want it)
# ============================================================================
Write-Host 'PowerShell: UTF-8 enabled' -ForegroundColor Green
