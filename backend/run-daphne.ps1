<#
run-daphne.ps1
Usage:
  .\run-daphne.ps1           # runs Daphne on default port 8001
  .\run-daphne.ps1 -Port 8001

If PowerShell blocks running scripts, run once (as user):
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
#>

param(
  [int]$Port = 8001
)

# Move to the script directory (backend)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Path to python in the venv
$PythonPath = Join-Path $ScriptDir "venv\Scripts\python.exe"

if (-not (Test-Path $PythonPath)) {
    Write-Error "Python not found in venv at $PythonPath. Verifique se o venv existe e está aqui: $ScriptDir\venv"
    exit 1
}

Write-Host "Usando Python:" $PythonPath
Write-Host "Iniciando Daphne na porta $Port... (CTRL+C para parar)"

# Ensure Django settings var is set for Daphne
$env:DJANGO_SETTINGS_MODULE = 'helpsister.settings'

# Run Daphne (this stays attached to the console)
& $PythonPath -m daphne -b 127.0.0.1 -p $Port helpsister.asgi:application
