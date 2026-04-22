# KubeAssist Security Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate identified security vulnerabilities (VULN-001 to VULN-007) including dependency updates, API authentication, CORS hardening, and agent tool validation.

**Architecture:** 
- **Dependencies**: Upgrade vulnerable packages in `backend/requirements.txt`.
- **API Security**: Implement a basic API key authentication middleware for all FastAPI routes and restrict CORS origins.
- **Agent Safety**: Add validation logic for tool arguments and implement a redaction layer for sensitive cluster data.
- **GitOps Hardening**: Add schema validation for `patch_data` in `GitOpsToolbox`.

**Tech Stack:** FastAPI, Python 3.12, LangChain, Pydantic, python-dotenv

---

### Task 1: Dependency Upgrades (VULN-001)

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Identify latest secure versions and update requirements.txt**

Update `backend/requirements.txt`:
```text
fastapi==0.109.2
uvicorn==0.27.1
langchain==0.2.0
langchain-community==0.2.5
langchain-core==0.3.84
langchain-google-genai==1.0.3
langgraph==1.0.10
langsmith==0.7.31
pydantic==2.6.1
python-dotenv==1.2.2
kubernetes==29.0.0
pyyaml==6.0.1
protobuf==5.29.6
starlette==0.47.2
```

- [ ] **Step 2: Install updated dependencies**

Run: `pip install -r backend/requirements.txt`
Expected: Successful installation without conflicts.

- [ ] **Step 3: Run existing tests to ensure no regressions**

Run: `pytest backend/tests/`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/requirements.txt
git commit -m "security: upgrade vulnerable dependencies (VULN-001)"
```

---

### Task 2: CORS Hardening (VULN-002)

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/.env` (Create if missing)

- [ ] **Step 1: Define allowed origins in .env**

Add to `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

- [ ] **Step 2: Update main.py to use allowed origins from env**

Modify `backend/main.py`:
```python
import os
from dotenv import load_dotenv
load_dotenv()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

- [ ] **Step 3: Verify CORS with a test script**

Create `backend/tests/test_cors.py`:
```python
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_cors_allowed_origin():
    response = client.get("/", headers={"Origin": "http://localhost:5173"})
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"

def test_cors_disallowed_origin():
    response = client.get("/", headers={"Origin": "http://evil.com"})
    assert "access-control-allow-origin" not in response.headers
```

- [ ] **Step 4: Commit**

```bash
git add backend/main.py backend/.env backend/tests/test_cors.py
git commit -m "security: harden CORS configuration (VULN-002)"
```

---

### Task 3: API Authentication (VULN-003)

**Files:**
- Modify: `backend/.env`
- Modify: `backend/api/routes.py`

- [ ] **Step 1: Define API Key in .env**

Add to `backend/.env`:
```env
KUBEASSIST_API_KEY=super-secret-key-123
```

- [ ] **Step 2: Implement API Key dependency in routes.py**

Modify `backend/api/routes.py`:
```python
from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_api_key(api_key: str = Security(api_key_header)):
    if api_key == os.getenv("KUBEASSIST_API_KEY"):
        return api_key
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials"
    )

# Apply to routes:
@router.post("/api/scan-cluster")
async def scan_cluster(namespace: str = "default", api_key: str = Security(get_api_key)):
    ...
```

- [ ] **Step 3: Update frontend to send API Key**

Modify `frontend/src/App.tsx`:
Add header `X-API-Key` to all fetch calls.

- [ ] **Step 4: Commit**

```bash
git commit -m "security: implement API key authentication (VULN-003)"
```

---

### Task 4: Agent Tool Validation (VULN-006)

**Files:**
- Modify: `backend/agents/tools.py`

- [ ] **Step 1: Implement validation logic**

Modify `backend/agents/tools.py`:
```python
import re

def validate_namespace(ns: str):
    if not re.match(r"^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", ns):
        raise ValueError(f"Invalid namespace: {ns}")
    # Whitelist check
    if ns not in ["default", "kube-system"]: # Example whitelist
        raise ValueError(f"Unauthorized namespace: {ns}")

@tool
def get_logs(pod_name: str, namespace: str = "default", tail: int = 50):
    validate_namespace(namespace)
    if tail > 500: tail = 500 # Sanitize tail
    return kube_toolbox.get_logs(pod_name, namespace, tail)
```

- [ ] **Step 2: Commit**

```bash
git commit -m "security: add input validation for agent tools (VULN-006)"
```

---

### Task 5: Data Redaction (VULN-007)

**Files:**
- Create: `backend/tools/redactor.py`
- Modify: `backend/tools/scanner.py`

- [ ] **Step 1: Create Redactor utility**

```python
import re
import json

def redact_sensitive_data(data: Any) -> Any:
    # Logic to mask env variables, secrets, and common tokens
    ...
```

- [ ] **Step 2: Integrate Redactor into ClusterScanner**

Modify `backend/tools/scanner.py`:
```python
from backend.tools.redactor import redact_sensitive_data

def get_full_cluster_context(self) -> Dict[str, Any]:
    context = { ... }
    return redact_sensitive_data(context)
```

- [ ] **Step 3: Commit**

```bash
git commit -m "security: implement data redaction layer (VULN-007)"
```
