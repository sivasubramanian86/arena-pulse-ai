# ArenaPulseAI — Backend Deployment via Google Cloud Shell

## Why Cloud Shell?

`gcloud builds submit` is blocked on your local machine because your GCP project's
Cloud Storage API has a billing propagation delay (can take up to 24h after billing
re-activation). Cloud Shell bypasses this by running directly inside Google's
infrastructure where the billing context resolves immediately.

## One-Time Setup (5 minutes)

### Step 1 — Zip the backend folder

Run this in your local PowerShell from the project root:

```powershell
Compress-Archive -Path backend\* -DestinationPath backend.zip -Force
```

### Step 2 — Open Google Cloud Shell

Go to: **https://shell.cloud.google.com**

Make sure you are signed in as `kailasamsiva@gmail.com`

### Step 3 — Upload the zip

In Cloud Shell, click the **⋮ (More)** menu → **Upload** → select `backend.zip`

Then in the Cloud Shell terminal:

```bash
mkdir -p backend && unzip -o backend.zip -d backend/
```

### Step 4 — Upload the deploy script

Upload `scripts/deploy-cloudshell.sh` the same way, then:

```bash
chmod +x deploy-cloudshell.sh
bash deploy-cloudshell.sh
```

### Step 5 — Bake the backend URL into the frontend

After Step 4 completes, you will see output like:

```
Cloud Run URL: https://arenapulse-backend-xxxx-uc.a.run.app
```

Copy that URL, then run **locally** in PowerShell:

```powershell
$env:NEXT_PUBLIC_BACKEND_URL = "https://arenapulse-backend-xxxx-uc.a.run.app"
.\scripts\deploy-frontend.ps1
```

This rebuilds the Next.js static export with the backend URL baked in and
re-deploys to https://arena-pulse-ai.web.app

---

## Alternative: Install Docker Desktop Locally

If you prefer to deploy everything locally without Cloud Shell:

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Run: `.\scripts\deploy-backend.ps1`

Docker Desktop auto-integrates with `gcloud auth configure-docker` and bypasses
Cloud Build entirely by building the image locally and pushing directly to
Artifact Registry.

---

## Current Deployment State

| Component          | Status     | URL                                    |
|--------------------|------------|----------------------------------------|
| Firebase Hosting   | **LIVE**   | https://arena-pulse-ai.web.app         |
| Cloud Run Backend  | Pending    | Deploy via Cloud Shell or Docker       |
| GCS Media Assets   | Pending    | Uploads after billing propagates       |
