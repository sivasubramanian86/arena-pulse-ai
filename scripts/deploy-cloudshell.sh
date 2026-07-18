#!/bin/bash
# deploy-cloudshell.sh
# Run this script from Google Cloud Shell: https://shell.cloud.google.com
# Steps:
#   1. Open https://shell.cloud.google.com
#   2. Click the Upload button and upload the entire backend/ folder (zip it first)
#   3. Unzip: unzip backend.zip -d backend
#   4. Then run: bash deploy-cloudshell.sh

set -euo pipefail

PROJECT_ID="genai-apac-2026-491004"
REGION="us-central1"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/arenapulse-repo/arenapulse-backend:latest"

echo "=== ArenaPulseAI Backend Deploy via Cloud Shell ==="
echo "Project: $PROJECT_ID | Region: $REGION"

# Set project
gcloud config set project "$PROJECT_ID"

# Ensure Artifact Registry exists
gcloud artifacts repositories create arenapulse-repo \
  --project="$PROJECT_ID" \
  --repository-format=docker \
  --location="$REGION" \
  --description="ArenaPulseAI Docker Repository" 2>/dev/null || true

# Configure Docker
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Build via Cloud Build (Cloud Shell has its own billing context)
echo "Building backend image via Cloud Build..."
gcloud builds submit ./backend \
  --project="$PROJECT_ID" \
  --tag="$IMAGE_TAG"

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
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

echo ""
echo "=== Backend Deployed! ==="
echo "Cloud Run URL: $BACKEND_URL"
echo ""
echo "Now redeploy the frontend with this backend URL:"
echo "  In your LOCAL terminal:"
echo "  \$env:NEXT_PUBLIC_BACKEND_URL='$BACKEND_URL'"
echo "  .\\scripts\\deploy-frontend.ps1"
