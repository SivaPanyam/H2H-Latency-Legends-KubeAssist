# ☸️ KubeAssist: Agentic AI Ops Assistant for Kubernetes

KubeAssist is an AI-powered "Autopilot" for Kubernetes SREs, designed to automate the diagnostic journey by translating natural language intent into actionable cluster operations and "Shift-Left" remediations.

## 🏗️ System Architecture

### 1. Agentic Loop (LangGraph)
The core of KubeAssist is a stateful agentic loop implemented with **LangGraph**.
- **Reasoner Node**: Powered by **Gemini 1.5 Pro**, it plans investigation steps, analyzes tool outputs, and performs cross-signal correlation.
- **Tool Node**: Executes specialized Python wrappers for cluster interaction.
- **State Management**: Uses a `TypedDict` to maintain conversational history, command logs, observations, and diagnostic plans.

### 2. Tooling & Capabilities
- **KubectlToolbox**: Secure wrappers for `get pods`, `describe`, `logs`, `events`, and `top pods`. It parses raw output into structured JSON for the LLM.
- **ClusterScanner**: Orchestrates comprehensive data gathering across the entire cluster, including metrics and external security scans (Trivy).
- **GitOpsToolbox**: Enables "Shift-Left" remediation by:
  - Applying patches to local YAML manifests in-memory.
  - Generating standard `git diff` outputs.
  - Proposing simulated Pull Requests to prevent configuration drift.

### 3. Backend Infrastructure (FastAPI)
- **REST API**: 
  - `/api/query`: Interactive agentic reasoning.
  - `/api/scan-cluster`: Comprehensive one-shot cluster audit using Gemini's large context window.
  - `/api/apply-fix`: Direct GitOps remediation for identified issues.
- **WebSockets**: `/ws/stream` for real-time broadcasting of the agent's "Thought Stream" and status updates to the frontend.

### 4. Frontend (React + React Flow)
- **Operations Dashboard**: A professional dark-mode UI built with Tailwind CSS.
- **Visual Cluster Map**: Uses **React Flow** to visualize the microservices topology.
- **Security Audit Center**: A specialized dashboard to trigger full cluster scans, view categorized issues (Performance, Security, Config), and trigger GitOps fixes with a single click.
- **Live Reasoning Stream**: A side panel that displays real-time logs from the agent as it navigates the cluster.

## 🛠️ Tech Stack
- **LLM**: Google Gemini 1.5 Pro (via LangChain)
- **Orchestration**: LangGraph
- **Backend**: Python 3.12 + FastAPI + Uvicorn
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Visualization**: React Flow
- **K8s Environment**: Minikube / kind with Online Boutique microservices

## 📂 Project Structure
- `backend/agents/`: LangGraph state, tools, and workflow definitions.
- `backend/tools/`: Core logic for interacting with K8s and GitOps.
- `backend/faults/`: YAML scenarios for OOM, CrashLoopBackOff, and Pending pod failures.
- `frontend/src/components/ClusterMap.tsx`: React Flow implementation for the visual topology.
- `k8s/`: Kubernetes manifests for the target microservices.

## 🚀 Key Workflows
1. **Detection**: Agent scans the namespace for unhealthy pods.
2. **Correlation**: Agent gathers logs, describes events, and checks resource metrics to find the root cause.
3. **Remediation**: Agent proposes a fix by generating a git diff and drafting a Pull Request, adhering to GitOps best practices.
