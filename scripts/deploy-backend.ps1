# deploy-backend.ps1
# Standalone Cloud Run backend deploy script for ArenaPulseAI
# Requires: Active GCP billing + Docker Desktop OR working Cloud Build

$ErrorActionPreference = "Stop"

$ProjectId = "genai-apac-2026-491004"
$Region    = "us-central1"
$ImageTag  = "${Region}-docker.pkg.dev/${ProjectId}/arenapulse-repo/arenapulse-backend:latest"

Write-Host "=== Setting GCP Project ===" -ForegroundColor Cyan
gcloud config set project $ProjectId

# ── Artifact Registry ──────────────────────────────────────────
Write-Host "=== Ensuring Artifact Registry Repo ===" -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
gcloud artifacts repositories describe arenapulse-repo --location=$Region --project=$ProjectId >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    gcloud artifacts repositories create arenapulse-repo `
        --project=$ProjectId --repository-format=docker `
        --location=$Region --description="ArenaPulseAI Docker Repository"
} else {
    Write-Host "Repo already exists." -ForegroundColor Yellow
}
$ErrorActionPreference = "Stop"

gcloud auth configure-docker "${Region}-docker.pkg.dev" --quiet

# ── Build Strategy ─────────────────────────────────────────────
Write-Host "=== Building Backend Image ===" -ForegroundColor Cyan
Write-Host "Trying Cloud Build..." -ForegroundColor Green
$ErrorActionPreference = "Continue"
gcloud builds submit ./backend --project=$ProjectId --tag=$ImageTag
$buildOk = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = "Stop"

if (-not $buildOk) {
    Write-Host "Cloud Build failed. Checking for Docker..." -ForegroundColor Yellow
    $dockerOk = $false
    try {
        docker info >$null 2>&1
        $dockerOk = ($LASTEXITCODE -eq 0)
    } catch {}

    if ($dockerOk) {
        Write-Host "Docker found. Building locally..." -ForegroundColor Green
        docker build -t $ImageTag ./backend
        docker push $ImageTag
    } else {
        Write-Host ""
        Write-Host "BLOCKED: Both Cloud Build and Docker are unavailable." -ForegroundColor Red
        Write-Host "To resolve, choose ONE of:" -ForegroundColor Yellow
        Write-Host "  A) Fix billing: https://console.cloud.google.com/billing" -ForegroundColor Yellow
        Write-Host "     Then re-run: .\scripts\deploy-backend.ps1" -ForegroundColor Yellow
        Write-Host "  B) Install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        Write-Host "     Then re-run: .\scripts\deploy-backend.ps1" -ForegroundColor Yellow
        exit 1
    }
}

# ── Cloud Run Deploy ───────────────────────────────────────────
Write-Host "=== Deploying to Cloud Run ===" -ForegroundColor Cyan
gcloud run deploy arenapulse-backend `
    --project=$ProjectId `
    --image=$ImageTag `
    --platform=managed `
    --region=$Region `
    --allow-unauthenticated `
    --memory=1Gi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --set-env-vars="USE_VERTEX_AI=true,GOOGLE_CLOUD_PROJECT=${ProjectId},GOOGLE_CLOUD_LOCATION=${Region}"

$BackendUrl = (gcloud run services describe arenapulse-backend `
    --project=$ProjectId --region=$Region --format="value(status.url)").Trim()

Write-Host ""
Write-Host "=== Backend Deployment Complete! ===" -ForegroundColor Green
Write-Host "  Cloud Run URL: $BackendUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Now run the frontend deploy to bake in the backend URL:" -ForegroundColor Cyan
Write-Host "  `$env:NEXT_PUBLIC_BACKEND_URL='$BackendUrl'; .\scripts\deploy-frontend.ps1" -ForegroundColor White
