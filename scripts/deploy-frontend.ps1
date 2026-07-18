# deploy-frontend.ps1
# Standalone Firebase Hosting deploy script for ArenaPulseAI
# Does NOT require GCS billing — deploys static Next.js export to Firebase Hosting only.

$ErrorActionPreference = "Stop"

$ProjectId   = "genai-apac-2026-491004"
$HostingSite = "arena-pulse-ai"

# If the backend is already running, set its URL here. Otherwise leave blank.
$BackendUrl = $env:NEXT_PUBLIC_BACKEND_URL
if (-not $BackendUrl) {
    $ErrorActionPreference = "Continue"
    $BackendUrl = (gcloud run services describe arenapulse-backend `
        --project=$ProjectId --region="us-central1" `
        --format="value(status.url)" 2>$null).Trim()
    $ErrorActionPreference = "Stop"
}
if ($BackendUrl) {
    Write-Host "Using backend URL: $BackendUrl" -ForegroundColor Green
    $env:NEXT_PUBLIC_BACKEND_URL = $BackendUrl
} else {
    Write-Host "WARNING: No backend URL found. Frontend will run without backend." -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────
Write-Host "=== Building Next.js Static Export ===" -ForegroundColor Cyan
Set-Location frontend

Write-Host "Installing dependencies (--legacy-peer-deps)..." -ForegroundColor Green
npm install --legacy-peer-deps

Write-Host "Building static pages..." -ForegroundColor Green
npm run build

Set-Location ..

# ─────────────────────────────────────────────────────────────
Write-Host "=== Ensuring Firebase Hosting Site '$HostingSite' Exists ===" -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
npx -y firebase-tools@latest hosting:sites:describe $HostingSite --project=$ProjectId >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Firebase Hosting site '$HostingSite'..." -ForegroundColor Green
    npx -y firebase-tools@latest hosting:sites:create $HostingSite --project=$ProjectId 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Site already exists (409) - continuing." -ForegroundColor Yellow
    }
} else {
    Write-Host "Firebase Hosting site '$HostingSite' already exists." -ForegroundColor Yellow
}
$ErrorActionPreference = "Stop"

Write-Host "=== Deploying to Firebase Hosting: $HostingSite ===" -ForegroundColor Cyan
npx -y firebase-tools@latest deploy --only "hosting:$HostingSite" --project=$ProjectId

Write-Host ""
Write-Host "=== Frontend Deployment Complete! ===" -ForegroundColor Green
Write-Host "  Live URL: https://${HostingSite}.web.app" -ForegroundColor Green
if ($BackendUrl) {
    Write-Host "  Backend : $BackendUrl" -ForegroundColor Green
}
