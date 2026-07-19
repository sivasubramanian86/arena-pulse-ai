#!/usr/bin/env python3
"""Check pip-audit JSON output and exit non-zero on high/critical vulnerabilities.

This helper is used by .github/workflows/security-scan.yml to fail the workflow when
pip-audit reports any high or critical severity findings.

The pip-audit JSON shape can vary between versions. This script accepts either:
- {"dependencies": [ {"name":..., "vulns": [...]}, ... ]}
- [ {"name":..., "vulns": [...]}, ... ]

If the JSON content is unexpected, the script exits with code 2 so the workflow fails
and surfaces the parsing issue for debugging.
"""
import json
import sys
import os
from typing import Any

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

# Normalize to a list of package entries
deps = []
if isinstance(data, dict):
    if "dependencies" in data and isinstance(data["dependencies"], list):
        deps = data["dependencies"]
    elif "vulnerabilities" in data and isinstance(data["vulnerabilities"], list):
        deps = data["vulnerabilities"]
    else:
        # Maybe pip-audit produced a dict keyed by package name -> details
        # Try to extract list values
        possible = [v for v in data.values() if isinstance(v, (list, dict))]
        if possible:
            # flatten lists
            for p in possible:
                if isinstance(p, list):
                    deps.extend(p)
                elif isinstance(p, dict):
                    deps.append(p)
        else:
            print("Unexpected pip-audit JSON structure (dict) — please inspect:", type(data))
            sys.exit(2)
elif isinstance(data, list):
    deps = data
else:
    print("Unexpected pip-audit JSON root type:", type(data))
    sys.exit(2)

# Scan for high/critical
for pkg in deps:
    if not isinstance(pkg, dict):
        # Some pip-audit versions may include strings or other artifacts; skip non-dict entries
        continue
    # vulns may be under 'vulns' or 'vulnerabilities'
    vulns = pkg.get("vulns") or pkg.get("vulnerabilities") or []
    if not isinstance(vulns, list):
        # sometimes nested differently — skip if unexpected
        continue
    for vuln in vulns:
        if not isinstance(vuln, dict):
            # vulnerability entry might be a string identifier — skip
            continue
        sev = (vuln.get("severity") or "").lower()
        if sev in ("high", "critical"):
            print("High/Critical vulnerability found:", pkg.get("name"), vuln.get("id") or vuln.get("alias") or vuln)
            sys.exit(1)

print("No high/critical vulnerabilities found")
sys.exit(0)
