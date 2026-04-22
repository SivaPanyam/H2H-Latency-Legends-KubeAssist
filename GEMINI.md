# ☸️ KubeAssist: Agentic AI Ops Assistant for Kubernetes

KubeAssist is a Production-Grade AI "Autopilot" for Kubernetes SREs. It transforms the traditionally manual diagnostic process into an automated, multi-signal reasoning journey, enabling engineers to manage complex microservices with unprecedented speed and safety.

## 🌟 The Core "Meaning" of KubeAssist
KubeAssist is built on the philosophy of **Operational Intelligence**. It isn't just a chatbot; it is a dual-mode system that bridges the gap between raw cluster telemetry and human-codified remediation.
1.  **Proactive Audit**: Scans the entire cluster state (Security, Performance, Config) in one shot to find "hidden" risks.
2.  **Reactive Assistance**: Acts as an expert pair-programmer for SREs to root-cause active incidents and generate GitOps-ready fixes.

---

## 🏗️ System Architecture

### 1. The Reasoning Engine (LangGraph)
The heart of KubeAssist is a stateful agentic loop powered by **Gemini 2.5 Flash**.
- **Context-Aware Planning**: Uses a massive context window to ingest logs, metrics, and events simultaneously.
- **Agentic ReAct Loop**: Autonomously decides which tools to call, evaluates their output, and adjusts its plan in real-time.
- **Shift-Left Mandate**: The agent is hard-coded to prefer GitOps (Pull Requests) over direct cluster mutations (`kubectl apply`), ensuring system integrity.

### 2. Operational Intelligence Layers
- **Interactive Cluster Map**: Visualizes the microservices topology with real-time node selection.
- **Deep Telemetry Streaming**: Selecting a pod in the UI triggers an automated data-fetch of:
    - **Live Metrics**: CPU and Memory consumption via `kubectl top`.
    - **Log Streamer**: The latest 20-50 lines of pod logs.
    - **Lifecycle Events**: Critical K8s events (Warnings, Pulled, Created, Failed).
- **Performance Dashboard**: A cluster-wide monitoring view that identifies top resource consumers and node utilization bottlenecks.

### 3. Comprehensive One-Shot Audit
A specialized pipeline that aggregates:
- **Trivy Security Scans**: Scans images and configurations for vulnerabilities.
- **Configuration Drift**: Compares live resources against target manifests.
- **Resource Efficiency**: Identifies over-provisioned or throttled services.

---

## 🛠️ Updated Tech Stack
- **LLM**: **Google Gemini 2.5 Flash** (Optimized for speed and long-context reasoning)
- **Backend**: FastAPI + Python 3.12 (Asynchronous Telemetry Aggregation)
- **Frontend**: React 18 + TypeScript + Tailwind CSS (Operations Center Layout)
- **Visualization**: React Flow (Dynamic Topology Graphing)
- **Tooling**: trivy, kubectl, GitOps-Toolbox

---

## 📂 Project Structure
- `backend/api/`: Structured FastAPI routers and WebSocket managers.
- `backend/tools/scanner.py`: Orchestrates the "Big Gulp" data gathering for audits.
- `backend/tools/gitops_toolbox.py`: Generates standard Git diffs for remediation.
- `frontend/src/App.tsx`: The unified dashboard managing Map, Assistant, Audit, and Performance modes.

## 🚀 Key Workflows
1. **One-Shot Audit**: Aggregates full cluster context -> Gemini analyzes all signals -> Categorized Report -> One-click GitOps Fix.
2. **Deep-Dive Investigation**: User selects a pod -> Real-time telemetry streams to sidebar -> User initiates chat -> Agent proposes surgical fix via PR.
