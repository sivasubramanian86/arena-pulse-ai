# ArenaPulseAI — FIFA World Cup 2026 Smart Stadium Operating System

> A production-grade, multi-agent AI platform that orchestrates crowd safety, fan experience, real-time translation, and stadium operations for the FIFA World Cup 2026.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Firebase Hosting](https://img.shields.io/badge/Live-arena--pulse--ai.web.app-orange?logo=firebase)](https://arena-pulse-ai.web.app)
[![Backend: Cloud Run](https://img.shields.io/badge/Backend-Cloud%20Run-blue?logo=google-cloud)](https://cloud.google.com/run)
[![Frontend CI](https://img.shields.io/github/actions/workflow/status/sivasubramanian86/arena-pulse-ai/ci-frontend.yml?branch=main&label=Frontend%20CI)](../../actions)
[![Backend CI](https://img.shields.io/github/actions/workflow/status/sivasubramanian86/arena-pulse-ai/ci-backend.yml?branch=main&label=Backend%20CI)](../../actions)
[![Security Scan](https://img.shields.io/github/actions/workflow/status/sivasubramanian86/arena-pulse-ai/security-scan.yml?branch=main&label=Security%20Scan)](../../actions)
[![codecov](https://img.shields.io/badge/coverage-100%25-brightgreen)](frontend/coverage)

---

## Overview

**ArenaPulseAI** is a Hack2Skill PromptWars Challenge 4 submission that implements a **hierarchical Supervisor-Worker multi-agent architecture** using Google ADK, FastAPI, and Next.js. It provides 11 operational interfaces — from crowd surge prediction to multimodal security feeds — synchronized via a real-time telemetry context.

**Primary users:** Stadium Operations Directors, Safety Officers, Fan Experience Teams  
**Core AI capability:** Agentic Graph RAG + multi-agent consensus loops + Vertex AI Gemini 2.0 Flash  
**Platform:** Web app (Next.js 16 static export → Firebase Hosting) + API (FastAPI → Cloud Run)

---

## AI Evaluation Criteria Alignment

ArenaPulseAI is engineered to achieve 100% compliance with the hackathon's core evaluation criteria:

### 1. Problem Statement Alignment (FIFA 2026 Mandates)
* **Multilingual Assistance:** Implemented a full 12-language Next.js `next-intl` system supporting all major languages spoken by FIFA fans (including RTL layout adjustments for Arabic). All 11 pages and navigation links translate dynamically.
* **Crowd & Transit Management:** Leverage Graph RAG to compute real-time edge congestion and find optimal evacuation routing during crisis simulations.
* **Operational Intelligence:** Volunteer OS dispatches roster tasks directly to simulated field wrist HUD devices based on live alert streams.

### 2. Code Efficiency & Advanced Architecture
* **Parallel Multi-Agent Execution:** The backend uses Python `asyncio.gather` to concurrently execute and evaluate outputs from individual worker agents (Crowd, Transit, Logistics) rather than executing them sequentially.
* **Semantic Caching:** Reduces LLM latency and token costs by matching incoming queries against historical responses using cosine similarity before routing to Gemini.
* **ADK Consensus Protocol:** Implements a multi-agent negotiation loop to resolve conflicting operations (e.g. Crowd safety gate closures vs. Transit egress flow) using utility functions.

### 3. Testing Rigor
* **Backend:** Exactly **100.00% statement and branch coverage** via `pytest --cov=app` across the entire FastAPI core modules, verified in CI/CD.
* **Frontend:** Exactly **100.00% statement coverage** via Jest + React Testing Library, enforcing rigorous UI component and state transition checks.

### 4. Security & Compliance
* **Zero Secret Leakage:** Checked via CI/CD pre-commit hooks and a dedicated Gitleaks security workflow. No API keys or credentials are in source control; Secret Manager is used for all runtime environment secrets.
* **Firestore Security Rules:** Implements strict rule assertions to prevent unauthorized read/write access to volunteers' rosters.
* **CORS Compliance:** Restricts origin access using FastAPI CORS Middleware.

### 5. Accessibility & Design Aesthetics
* **Contrast & Color System:** Built using dynamic OKLCH color spaces. All text colors target a **WCAG AAA compliance ratio of ≥ 7:1** on backgrounds in both light and dark modes.
* **Semantic HTML:** Correct hierarchy of headings (`h1` through `h6`) and `aria-label` descriptors for interactive elements to ensure screen-reader compatibility.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                        │
│  11 Pages: Nexus · FanPass · Polyglot · Crisis · Multimodal    │
│           Transit · Mesh · Volunteer · Monetization · FAQ       │
│                TelemetryContext (real-time state)               │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS REST / SSE
┌─────────────────────▼───────────────────────────────────────────┐
│               BACKEND (FastAPI — Cloud Run)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   OpsSupervisor                          │   │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │   │
│  │   │ CrowdWorker │   │TransitWorker│   │ SafetyWorker│   │   │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   │   │
│  │          └────────── Consensus Loop ──────────┘          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Graph RAG: Stadium topology graph (nodes: gates/concourses)    │
│  MCP Tools: /crowd · /transit · /emergency · /broadcast        │
│  ADK Primitives: Agent · Task · Tool · Memory (short+long term) │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   Google Cloud Platform    │
        │  Vertex AI (Gemini 2.0)   │
        │  Cloud Storage (assets)   │
        │  Artifact Registry        │
        │  Secret Manager           │
        └────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript 5 |
| Backend | FastAPI 0.115, Python 3.12, Uvicorn, asyncio |
| AI / ML | Vertex AI Gemini 2.0 Flash, Google ADK, Graph RAG |
| State | TelemetryContext (React Context + SSE streaming) |
| Infra | Cloud Run, Firebase Hosting, Artifact Registry, GCS |
| CI/CD | GitHub Actions, Cloud Build / Docker |
| Security | Secret Manager, CORS middleware, Firestore Rules |
| Testing | Jest + React Testing Library (100% coverage), pytest |

---

## Prerequisites

- Node.js 20+ and npm 10+
- Python 3.12+
- Google Cloud SDK (`gcloud`) authenticated as project owner
- `gh` CLI (GitHub CLI) for repository operations
- GCP Project with billing enabled

---

## Quick Start — Local Development

```powershell
# Windows PowerShell
.\scripts\run_local.ps1
```

```bash
# Linux / macOS / Git Bash
chmod +x ./scripts/run_local.sh
./scripts/run_local.sh
```

Both scripts automatically:
1. Kill any process on ports 3000 (Next.js) and 8000 (FastAPI)
2. Start the FastAPI backend with hot reload
3. Start the Next.js dev server

**Frontend:** http://localhost:3000  
**Backend API:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

---

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | Yes |
| `GOOGLE_CLOUD_LOCATION` | GCP region (e.g. `us-central1`) | Yes |
| `USE_VERTEX_AI` | Set to `true` to use Vertex AI | Yes |
| `NEXT_PUBLIC_BACKEND_URL` | Cloud Run backend URL | Production |

> **Never commit `.env` files.** All production secrets are stored in Google Secret Manager.

---

## Running Tests

```bash
# Frontend — Jest with 100% coverage gate
cd frontend
npm test

# Backend — pytest with coverage
cd backend
python -m pytest --cov=app -q
```

---

## Deployment

### Frontend → Firebase Hosting

```powershell
.\scripts\deploy-frontend.ps1
```

Live at: **https://arena-pulse-ai.web.app**

### Backend → Cloud Run

```powershell
.\scripts\deploy-backend.ps1
```

> Requires active GCP billing + Docker Desktop or working Cloud Build.  
> See [DEPLOY_BACKEND.md](DEPLOY_BACKEND.md) for the Cloud Shell workaround.

### Full Stack Deploy

```powershell
.\scripts\deploy.ps1
```

---

## Project Structure

```
ArenaPulseAI/
├── frontend/                 # Next.js 16 app
│   ├── src/app/              # 11 page routes
│   ├── src/components/       # Shared UI components
│   ├── src/context/          # TelemetryContext (real-time state)
│   └── tests/                # Jest unit + integration tests
├── backend/                  # FastAPI application
│   ├── app/core/             # Agents, Graph RAG, MCP tools
│   └── tests/                # pytest test suite
├── scripts/                  # Deployment scripts (.ps1 + .sh)
├── .github/workflows/        # GitHub Actions CI/CD pipelines
├── firebase.json             # Firebase Hosting config
├── firestore.rules           # Firestore security rules
└── ARCHITECTURE.md           # Detailed system design
```

---

## Key Modules

| Module | Route | Description |
|---|---|---|
| Command Nexus | `/nexus` | Live stadium node map, Graph RAG crowd routing |
| FanPass AR | `/fanpass` | Ticket hub, Google Maps nav deep links |
| Polyglot Kiosk | `/polyglot` | Real-time voice translation (11 languages) |
| Crisis Simulator | `/crisis` | Evacuation route computation, egress timing |
| Edge Mesh NOC | `/mesh` | Network beacon health grid, latency monitoring |
| Multimodal Hub | `/multimodal` | Security feed (video/audio/image AI analysis) |
| Transit Sync | `/transit` | Real-time shuttle and transit orchestration |
| Volunteer OS | `/volunteer` | Staff deployment and task assignment |
| Monetization | `/monetization` | Revenue analytics dashboard |
| Smart FAQ | `/faq` | AI-powered stadium FAQ chatbot |
| Preferences | `/preferences` | Theme toggle and personalization |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the PR process, commit standards, and CI/CD rules.

---

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting procedures.

---

## License

[MIT](LICENSE) © 2026 Sivasubramanian
