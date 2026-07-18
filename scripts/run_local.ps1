# run_local.ps1
# Script to launch ArenaPulseAI locally on Windows (PowerShell)

# 1. Terminate existing processes on Ports 3000 (Next.js) and 8000 (FastAPI)
Write-Host "Checking for active processes on ports 3000 and 8000..." -ForegroundColor Cyan

$ports = @(3000, 8000)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $procId = $conn.OwningProcess
            $processName = (Get-Process -Id $procId -ErrorAction SilentlyContinue).Name
            if ($processName) {
                Write-Host "Killing process '$processName' (PID: $procId) on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Allow a moment for ports to clear
Start-Sleep -Seconds 1

# 2. Launch FastAPI Backend
$projectRoot = Split-Path $PSScriptRoot -Parent
Write-Host "Launching FastAPI backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; .venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload"

# 3. Launch Next.js Frontend
Write-Host "Launching Next.js frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"

Write-Host "`nAll processes spawned successfully." -ForegroundColor Cyan
Write-Host "  - Backend API:       http://localhost:8000" -ForegroundColor Cyan
Write-Host "  - Frontend Client:   http://localhost:3000" -ForegroundColor Cyan
