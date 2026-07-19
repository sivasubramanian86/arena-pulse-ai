# ArenaPulseAI — FIFA World Cup 2026 Smart Stadium Operating System

> A production-grade, multi-agent AI platform that orchestrates crowd safety, fan experience, real-time translation, and stadium operations for the FIFA World Cup 2026.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Firebase Hosting](https://img.shields.io/badge/Live-arena--pulse--ai.web.app-orange?logo=firebase)](https://arena-pulse-ai.web.app)
[![Backend: Cloud Run](https://img.shields.io/badge/Backend-Cloud%20Run-blue?logo=google-cloud)](https://cloud.google.com/run)
[![Frontend CI](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/ci-frontend.yml/badge.svg?branch=main)](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/ci-frontend.yml)
[![Backend CI](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/ci-backend.yml/badge.svg?branch=main)](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/ci-backend.yml)
[![Security Scan](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/security-scan.yml/badge.svg?branch=main)](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/security-scan.yml)
[![Backend Coverage](https://img.shields.io/badge/Backend%20Coverage-100%25-brightgreen)](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/ci-backend.yml)
[![Frontend Coverage](https://img.shields.io/badge/Frontend%20Coverage-100%25-brightgreen)](https://github.com/sivasubramanian86/arena-pulse-ai/actions/workflows/ci-frontend.yml)

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
* **Stadium Safety and Security:** Integrates live telemetry, edge swarm anomaly detection, and consensus-based agent decisions to prevent crowd crush and coordinate emergency egress.
* **Fan Experience & Accessibility:** Includes FanPass navigation, Polyglot translation kiosk, and a multimodal operations hub to combine security alerts with guest services.

### 2. Code Efficiency & Advanced Architecture
* **Parallel Multi-Agent Execution:** The backend uses Python `asyncio.gather` to concurrently execute and evaluate outputs from individual worker agents (Crowd, Transit, Logistics) rather than executing them sequentially.
* **Semantic Caching:** Reduces LLM latency and token costs by matching incoming queries against historical responses using cosine similarity before routing to Gemini.
* **ADK Consensus Protocol:** Implements a multi-agent negotiation loop to resolve conflicting operations (e.g. Crowd safety gate closures vs. Transit egress flow) using utility functions.

### 3. Testing Rigor
* **Backend:** Exactly **100.00% statement and branch coverage** via `pytest --cov=app --cov-fail-under=100` across the entire FastAPI core modules, enforced in CI.
* **Frontend:** Exactly **100.00% statement coverage** via Jest + React Testing Library, enforced in CI through `npm run test:unit -- --ci`.

### 4. Quality Gates
* **Backend CI:** Runs Python linting with Ruff, static type checking with mypy, and 100% coverage across the full backend test suite.
* **Frontend CI:** Runs ESLint, production build verification, and unit tests.
* **Security:** Dedicated GitHub workflow performs secret scanning with Gitleaks, Node dependency auditing, and Python dependency auditing.

### 5. Security & Compliance
* **Zero Secret Leakage:** Checked via CI/CD pre-commit hooks and a dedicated Gitleaks security workflow. No API keys or credentials are in source control; Secret Manager is used for all runtime environment secrets.
* **Firestore Security Rules:** Implements strict rule assertions to prevent unauthorized read/write access to volunteers' rosters.
* **CORS Compliance:** Restricts origin access using FastAPI CORS Middleware.

### 5. Accessibility & Design Aesthetics
* **Contrast & Color System:** Built using dynamic OKLCH color spaces. All text colors target a **WCAG AAA compliance ratio of ≥ 7:1** on backgrounds in both light and dark modes.
* **Semantic HTML:** Correct hierarchy of headings (`h1` through `h6`) and `aria-label` descriptors for interactive elements to ensure screen-reader compatibility.

---

## Core Requirement Traceability

| Challenge Requirement | Implementation in ArenaPulseAI |
|---|---|
| Multilingual fan experience | 12-language `next-intl` UI with RTL support and dynamic translation contexts |
| Stadium safety and crowd management | FastAPI orchestrator, Graph RAG safe-route planning, edge swarm anomaly simulation, crisis alerting |
| Real-time AI-assisted operations | WebSocket telemetry + agent reasoning stream + task-based query handling |
| Secure, audit-ready delivery | GitHub security workflow, Gitleaks, dependency audits, CORS whitelist, Secret Manager documentation |
| Full-stack quality | Backend Ruff/mypy coverage gates + frontend ESLint/build/test gates in CI |

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
| `GOOGLE_CLOUD_PROJECT` | GCP project ID used when `USE_VERTEX_AI=true` | Required for Vertex AI workflows |
| `GOOGLE_CLOUD_LOCATION` | GCP region (e.g. `us-central1`) | Required for Vertex AI workflows |
| `USE_VERTEX_AI` | Set to `true` to use Vertex AI; otherwise uses `GEMINI_API_KEY` fallback | Optional |
| `GEMINI_API_KEY` | Gemini API key used when not using Vertex AI | Required if `USE_VERTEX_AI` is not `true` |
| `NEXT_PUBLIC_BACKEND_URL` | Cloud Run backend URL | Production |

> **Never commit `.env` files.** All production secrets are stored in Google Secret Manager.

---

## Running Tests & Verifying Coverage

### 1. How to Verify Test Coverage

Both frontend and backend are configured with strict coverage requirements (100% statement and branch coverage).

#### Backend Coverage Verification
Run the backend tests with coverage from the `backend/` directory:
```bash
cd backend
python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=100
```
This runs all 68 tests, prints lines that are uncovered (if any), and fails if total coverage drops below 100%.

#### Frontend Coverage Verification
Run the frontend Jest tests with coverage from the `frontend/` directory:
```bash
cd frontend
npm run test
```
This runs all 15 test suites (64 tests) and prints a comprehensive coverage table confirming 100% statement/branch coverage across all component files.

---

## Local Security Scanning

To audit package dependencies and scan for vulnerabilities locally before committing code:

### 1. Python Dependencies Scan
Run `pip-audit` to scan Python requirements against the PyPI vulnerability database:
```bash
cd backend
python -m pip_audit -r requirements.txt
```
To run the same check that the CI pipeline executes (which fails on high/critical findings):
```bash
python -m pip_audit -r requirements.txt -f json -o audit_backend.json
python ../scripts/check_pip_audit.py
```

### 2. Node Dependencies Scan
Run `npm audit` to check for security vulnerabilities in Node modules:
```bash
cd frontend
npm audit
```

### 3. Secret Scanner (Gitleaks)
To detect passwords, API keys, or private keys locally before pushing:
```bash
# Ensure Gitleaks is installed on your system
gitleaks detect --verbose
```

---

## Quality Gates

The ArenaPulseAI repository enforces the following quality gates in CI/CD and pre-commit hooks to ensure production readiness:

| Check / Gate | Target / Threshold | Tooling |
|---|---|---|
| **Backend Lint & Formatting** | Zero errors/warnings | `ruff check app` |
| **Backend Docstring Standards** | 100% coverage | `ruff check app --select D` |
| **Backend Static Type Checks** | Strict type compliance | `mypy --explicit-package-bases app` |
| **Backend Test Coverage** | 100.0% statement & branch | `pytest --cov=app --cov-fail-under=100` |
| **Frontend Linting** | Zero errors, strict style | `npm run lint` (`eslint`) |
| **Frontend Test Coverage** | 100.0% statement & branch | `jest --coverage` |
| **Security Auditing** | Zero high/critical vulnerabilities | `pip-audit` & `npm audit` |
| **Secret Leak Detection** | Zero credentials in git history | `gitleaks` scan |

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

## Assumptions and Out-of-Scope

### Key Assumptions
* **Telemetry Data Simulator:** The system uses simulated FIFA 2026 event data and stadium IoT telemetry. It is designed as an operational control proof of concept, not a live production control system.
* **Secret Provisioning:** Production secrets are expected to be provisioned via Google Secret Manager; local `.env` files are used only for sandbox development environments.
* **Active Feature Scope:** The feature set focuses on stadium operations, fan wayfinding, crisis simulation, and safety intelligence within a prompt-driven stadium control domain.

### Out-of-Scope Elements
* **Real CCTV Integration:** Real-world live CCTV feeds ingest and active biometric stream decoding are out of scope. They are mocked via simulated frame payloads.
* **Payment Gateways:** Third-party ticketing payment gateways and currency settlement APIs.
* **Facilities Management:** Automated physical HVAC/infrastructure actuator controls are not wired to live actuators.

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
