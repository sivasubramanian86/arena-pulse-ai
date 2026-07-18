# Contributing to ArenaPulseAI

Thank you for your interest in contributing. Please follow these guidelines to maintain code quality and CI/CD integrity.

---

## Branch Strategy

| Branch Pattern | Purpose |
|---|---|
| `main` | Protected. Production-ready. Requires PR + CI pass. |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation only |
| `ci/<name>` | CI/CD changes |
| `refactor/<name>` | Code restructuring |

**Never push directly to `main`.**

---

## Commit Message Standard (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body — what and why]

[optional footer — BREAKING CHANGE, closes #N]
```

**Types:** `feat` · `fix` · `docs` · `test` · `refactor` · `chore` · `ci` · `perf` · `style`

**Examples:**
```
feat(agents): add consensus loop between CrowdWorker and TransitWorker
fix(multimodal): resolve selectedFile optional chain lint error
docs(readme): update deployment section with Cloud Shell instructions
ci(actions): add backend pytest coverage gate
```

---

## Pull Request Process

1. Create a feature branch from `main`
2. Ensure all tests pass locally:
   ```bash
   cd frontend && npm test
   cd backend && python -m pytest
   ```
3. Ensure no secrets are committed (run secret scan from skill `@10_security_governance`)
4. Open a PR against `main` — CI will run automatically
5. Require **1 approving review** before merging

---

## Code Quality Gates

All PRs must pass:
- `npm run build` — TypeScript compilation (zero errors)
- `npm test` — Jest suite with 100% coverage thresholds
- `python -m pytest` — Backend test suite
- ESLint — zero errors
- `npm audit` — no critical vulnerabilities

---

## Local Development Setup

```powershell
# Windows
.\scripts\run_local.ps1

# Linux / macOS
./scripts/run_local.sh
```

---

## Questions

Open a GitHub Discussion or email kailasamsiva@gmail.com.
