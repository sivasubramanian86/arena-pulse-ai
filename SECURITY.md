# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch | Yes |
| Tagged releases | Yes |
| Feature branches | No |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Report security issues privately via:
- **Email:** kailasamsiva@gmail.com
- **Subject:** `[SECURITY] ArenaPulseAI — <short description>`

### What to include

1. Affected component (frontend / backend / infrastructure)
2. Type of vulnerability (e.g. XSS, SSRF, secret exposure, IAM misconfiguration)
3. Steps to reproduce
4. Potential impact assessment
5. Suggested remediation (if known)

### Response SLA

| Severity | Initial Response | Resolution Target |
|---|---|---|
| Critical (RCE, data breach) | 24 hours | 72 hours |
| High (auth bypass, privilege escalation) | 48 hours | 7 days |
| Medium (information disclosure) | 5 days | 14 days |
| Low | 14 days | Next release |

## Security Architecture

- **Secrets:** All production secrets stored in Google Secret Manager — never in source code or `.env` files committed to git.
- **IAM:** Principle of least privilege. Cloud Run service account has only `roles/aiplatform.user` and `roles/secretmanager.secretAccessor`.
- **CORS:** Backend FastAPI enforces an explicit `allow_origins` whitelist.
- **CSP / Headers:** Firebase Hosting applies `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Firestore:** Security rules require authentication for all writes; public reads are scoped to anonymous telemetry only.
- **Dependency scanning:** `npm audit` and `pip-audit` run in CI on every PR.
