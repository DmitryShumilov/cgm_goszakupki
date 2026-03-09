# Convert all PS1 scripts to UTF-8 with BOM
$files = @('start_project.ps1', 'stop_project.ps1', 'install_project.ps1', 'check_project.ps1')

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = Get-Content -Path $f -Raw -Encoding UTF8
        $utf8BOM = New-Object System.Text.UTF8Encoding $true
        [System.IO.File]::WriteAllText("$PWD\$f", $content, $utf8BOM)
        Write-Host "Converted: $f"
    }
}

Write-Host "`nAll files converted to UTF-8 with BOM"
