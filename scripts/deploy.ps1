# deploy.ps1
# PowerShell automated deployment script for ArenaPulseAI to Google Cloud & Firebase with Vertex AI
# REQUIREMENT: Ensure billing is active on project genai-apac-2026-491004 before running.
# REQUIREMENT: Docker Desktop must be running for local image build (Cloud Build billing fallback).

$ErrorActionPreference = "Stop"

$ProjectId    = "genai-apac-2026-491004"
$Region       = "us-central1"
$BucketName   = "${ProjectId}-assets"
$HostingSite  = "arena-pulse-ai"   # Named Firebase Hosting site
$ImageTag     = "${Region}-docker.pkg.dev/${ProjectId}/arenapulse-repo/arenapulse-backend:latest"

# ─────────────────────────────────────────────────────────────
Write-Host "=== 1. Selecting Google Cloud Project ===" -ForegroundColor Cyan
gcloud config set project $ProjectId

# ─────────────────────────────────────────────────────────────
Write-Host "=== 2. Enabling GCP Services ===" -ForegroundColor Cyan
gcloud services enable `
    run.googleapis.com `
    artifactregistry.googleapis.com `
    aiplatform.googleapis.com `
    storage.googleapis.com `
    cloudbuild.googleapis.com `
    secretmanager.googleapis.com `
    firebase.googleapis.com

# ─────────────────────────────────────────────────────────────
Write-Host "=== 3. Configuring GCS Bucket & Uploading Assets ===" -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
gcloud storage buckets describe "gs://$BucketName" >$null 2>&1
$ErrorActionPreference = "Stop"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating GCS Bucket gs://$BucketName..." -ForegroundColor Green
    gcloud storage buckets create "gs://$BucketName" --project=$ProjectId --location=$Region
} else {
    Write-Host "GCS Bucket gs://$BucketName already exists." -ForegroundColor Yellow
}

gcloud storage buckets update "gs://$BucketName" --uniform-bucket-level-access

if (Test-Path "frontend/public/data") {
    Write-Host "Uploading local media assets to GCS..." -ForegroundColor Green
    gcloud storage cp -r frontend/public/data "gs://$BucketName/"
} else {
    Write-Host "WARNING: frontend/public/data not found - skipping asset upload." -ForegroundColor Yellow
}

Write-Host "Granting public read access to allUsers..." -ForegroundColor Green
$ErrorActionPreference = "Continue"
gcloud storage buckets add-iam-policy-binding "gs://$BucketName" --member="allUsers" --role="roles/storage.objectViewer"
$ErrorActionPreference = "Stop"

# ─────────────────────────────────────────────────────────────
Write-Host "=== 4. Granting Vertex AI User Role to Compute Service Account ===" -ForegroundColor Cyan
$ProjectNumber = (gcloud projects describe $ProjectId --format="value(projectNumber)").Trim()
Write-Host "Project Number: $ProjectNumber" -ForegroundColor Green
$ErrorActionPreference = "Continue"
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${ProjectNumber}-compute@developer.gserviceaccount.com" `
    --role="roles/aiplatform.user"
$ErrorActionPreference = "Stop"

# ─────────────────────────────────────────────────────────────
Write-Host "=== 5. Building & Deploying FastAPI Backend to Cloud Run ===" -ForegroundColor Cyan

# Ensure Artifact Registry repo exists
$ErrorActionPreference = "Continue"
gcloud artifacts repositories describe arenapulse-repo --location=$Region --project=$ProjectId >$null 2>&1
$ErrorActionPreference = "Stop"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Artifact Registry Docker repository..." -ForegroundColor Green
    gcloud artifacts repositories create arenapulse-repo `
        --project=$ProjectId `
        --repository-format=docker `
        --location=$Region `
        --description="ArenaPulseAI Docker Repository"
} else {
    Write-Host "Artifact Registry repository already exists." -ForegroundColor Yellow
}

# Configure Docker auth for Artifact Registry
Write-Host "Configuring Docker auth for Artifact Registry..." -ForegroundColor Green
gcloud auth configure-docker "${Region}-docker.pkg.dev" --quiet

# Attempt Cloud Build first; fall back to local Docker build if billing blocks it
Write-Host "Attempting Cloud Build submit..." -ForegroundColor Green
$ErrorActionPreference = "Continue"
gcloud builds submit ./backend --project=$ProjectId --tag=$ImageTag
$buildExitCode = $LASTEXITCODE
$ErrorActionPreference = "Stop"

if ($buildExitCode -ne 0) {
    Write-Host "Cloud Build failed (likely billing propagation lag). Falling back to local Docker build..." -ForegroundColor Yellow

    # Verify Docker is available
    $dockerVersion = docker version --format "{{.Server.Version}}" 2>$null
    if (-not $dockerVersion) {
        Write-Error "Docker Desktop is not running. Start Docker Desktop and re-run this script."
        exit 1
    }
    Write-Host "Docker version: $dockerVersion" -ForegroundColor Green

    Write-Host "Building Docker image locally..." -ForegroundColor Green
    docker build -t $ImageTag ./backend

    Write-Host "Pushing image to Artifact Registry..." -ForegroundColor Green
    docker push $ImageTag
}

Write-Host "Deploying arenapulse-backend to Cloud Run..." -ForegroundColor Green
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

$BackendUrl = (gcloud run services describe arenapulse-backend --project=$ProjectId --region=$Region --format="value(status.url)").Trim()
Write-Host "FastAPI Cloud Run backend deployed at: $BackendUrl" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────
Write-Host "=== 6. Building & Deploying Next.js Frontend to Firebase ===" -ForegroundColor Cyan
$env:NEXT_PUBLIC_BACKEND_URL = $BackendUrl
Write-Host "Backend URL baked into static assets: $env:NEXT_PUBLIC_BACKEND_URL" -ForegroundColor Green

Set-Location frontend

Write-Host "Installing frontend dependencies (--legacy-peer-deps for React 19 compat)..." -ForegroundColor Green
npm install --legacy-peer-deps

Write-Host "Building static export..." -ForegroundColor Green
npm run build

Set-Location ..

Write-Host "=== Ensuring Firebase Hosting Site '$HostingSite' Exists ===" -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
npx -y firebase-tools@latest hosting:sites:describe $HostingSite --project=$ProjectId >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Firebase Hosting site '$HostingSite'..." -ForegroundColor Green
    npx -y firebase-tools@latest hosting:sites:create $HostingSite --project=$ProjectId
} else {
    Write-Host "Firebase Hosting site '$HostingSite' already exists." -ForegroundColor Yellow
}
$ErrorActionPreference = "Stop"

Write-Host "Deploying to Firebase Hosting site '$HostingSite'..." -ForegroundColor Green
# Use --only hosting:SITE_ID syntax (compatible with all firebase-tools versions)
npx -y firebase-tools@latest deploy --only "hosting:$HostingSite" --project=$ProjectId

Write-Host ""
Write-Host "=== ArenaPulseAI Deployment Completed Successfully! ===" -ForegroundColor Cyan
Write-Host "  Firebase Hosting : https://${HostingSite}.web.app" -ForegroundColor Green
Write-Host "  Cloud Run Backend: $BackendUrl" -ForegroundColor Green