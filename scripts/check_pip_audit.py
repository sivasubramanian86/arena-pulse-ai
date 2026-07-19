#!/usr/bin/env python3
"""Check pip-audit JSON output and exit non-zero on high/critical vulnerabilities.

This helper is used by .github/workflows/security-scan.yml to fail the workflow when
pip-audit reports any high or critical severity findings.
"""
import json
import sys
import os

# Expected path: backend/audit_backend.json when run from the workflow step with working-directory: backend
audit_path = os.path.join(os.getcwd(), "audit_backend.json")
if not os.path.exists(audit_path):
    print("pip-audit did not produce audit_backend.json at", audit_path)
    # Treat missing file as a failure in the security workflow
    sys.exit(2)

try:
    with open(audit_path, "r", encoding="utf-8") as f:
        data = json.load(f)
except Exception as exc:
    print("pip-audit failed to produce JSON output or could not parse JSON:", exc)
    sys.exit(2)

for pkg in data:
    for vuln in pkg.get("vulns", []):
        sev = (vuln.get("severity") or "").lower()
        if sev in ("high", "critical"):
            print("High/Critical vulnerability found:", pkg.get("name"), vuln.get("id"), vuln.get("severity"))
            sys.exit(1)

print("No high/critical vulnerabilities found")
sys.exit(0)
