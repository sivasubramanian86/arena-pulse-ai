#!/bin/bash
# deploy.sh
# Automated deployment script for ArenaPulseAI to Google Cloud & Firebase with Vertex AI
# REQUIREMENT: Ensure billing is active on project genai-apac-2026-491004 before running.
# REQUIREMENT: Docker must be available for local image build (Cloud Build billing fallback).

set -euo pipefail

PROJECT_ID="genai-apac-2026-491004"
REGION="us-central1"
BUCKET_NAME="${PROJECT_ID}-assets"
HOSTING_SITE="arena-pulse-ai"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/arenapulse-repo/arenapulse-backend:latest"

# ─────────────────────────────────────────────────────────────
echo "=== 1. Selecting Google Cloud Project ==="
gcloud config set project "$PROJECT_ID"

# ─────────────────────────────────────────────────────────────
echo "=== 2. Enabling GCP Services ==="
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  firebase.googleapis.com

# ─────────────────────────────────────────────────────────────
echo "=== 3. Configuring GCS Bucket & Uploading Assets ==="
if ! gcloud storage buckets describe "gs://${BUCKET_NAME}" >/dev/null 2>&1; then
  echo "Creating GCS Bucket gs://${BUCKET_NAME}..."
  gcloud storage buckets create "gs://${BUCKET_NAME}" --project="$PROJECT_ID" --location="$REGION"
else
  echo "GCS Bucket gs://${BUCKET_NAME} already exists."
fi

gcloud storage buckets update "gs://${BUCKET_NAME}" --uniform-bucket-level-access

if [ -d "frontend/public/data" ]; then
  echo "Uploading local media assets to GCS..."
  gcloud storage cp -r frontend/public/data "gs://${BUCKET_NAME}/"
else
  echo "WARNING: frontend/public/data not found — skipping asset upload."
fi

echo "Granting public read access to allUsers..."
gcloud storage buckets add-iam-policy-binding "gs://${BUCKET_NAME}" \
  --member="allUsers" \
  --role="roles/storage.objectViewer" || true

# ─────────────────────────────────────────────────────────────
echo "=== 4. Granting Vertex AI User Role to Compute Service Account ==="
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user" || true

# ─────────────────────────────────────────────────────────────
echo "=== 5. Building & Deploying FastAPI Backend to Cloud Run ==="

# Ensure Artifact Registry repo exists
gcloud artifacts repositories create arenapulse-repo \
  --project="$PROJECT_ID" \
  --repository-format=docker \
  --location="$REGION" \
  --description="ArenaPulseAI Docker Repository" \
  2>/dev/null || echo "Artifact Registry repository already exists."

# Configure Docker auth for Artifact Registry
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Attempt Cloud Build first; fall back to local Docker build if billing blocks it
echo "Attempting Cloud Build submit..."
if ! gcloud builds submit ./backend --project="$PROJECT_ID" --tag="$IMAGE_TAG"; then
  echo "Cloud Build failed (likely billing propagation lag). Falling back to local Docker build..."

  if ! command -v docker &>/dev/null; then
    echo "ERROR: Docker is not installed or not in PATH. Install Docker and re-run." >&2
    exit 1
  fi

  echo "Building Docker image locally..."
  docker build -t "$IMAGE_TAG" ./backend

  echo "Pushing image to Artifact Registry..."
  docker push "$IMAGE_TAG"
fi

echo "Deploying arenapulse-backend to Cloud Run..."
gcloud run deploy arenapulse-backend \
  --project="$PROJECT_ID" \
  --image="$IMAGE_TAG" \
  --platform=managed \
  --region="$REGION" \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="USE_VERTEX_AI=true,GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GOOGLE_CLOUD_LOCATION=${REGION}"

BACKEND_URL=$(gcloud run services describe arenapulse-backend \
  --project="$PROJECT_ID" --region="$REGION" --format="value(status.url)")
echo "FastAPI Cloud Run backend deployed at: $BACKEND_URL"

# ─────────────────────────────────────────────────────────────
echo "=== 6. Building & Deploying Next.js Frontend to Firebase ==="
export NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL"
echo "Backend URL baked into static assets: $NEXT_PUBLIC_BACKEND_URL"

cd frontend

echo "Installing frontend dependencies (--legacy-peer-deps for React 19 compat)..."
npm install --legacy-peer-deps

echo "Building static export..."
npm run build

cd ..

echo "Deploying to Firebase Hosting site '$HOSTING_SITE'..."
# Use --only hosting:SITE_ID syntax (compatible with all firebase-tools versions)
npx -y firebase-tools@latest deploy --only "hosting:${HOSTING_SITE}" --project="$PROJECT_ID"

echo ""
echo "=== ArenaPulseAI Deployment Completed Successfully! ==="
echo "  Firebase Hosting : https://${HOSTING_SITE}.web.app"
echo "  Cloud Run Backend: $BACKEND_URL"
