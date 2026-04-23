# ☸️ KubeAssist: Agentic AI Ops Assistant for Kubernetes

KubeAssist is a Production-Grade AI "Autopilot" for Kubernetes SREs. It transforms the traditionally manual diagnostic process into an automated, multi-signal reasoning journey, enabling engineers to manage complex microservices with unprecedented speed and safety.

---

## 🚀 Getting Started

Follow these steps to set up KubeAssist in your local environment using Minikube.

### 📋 Prerequisites

Ensure you have the following installed:
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Node.js (v18+)](https://nodejs.org/)
- [Python 3.12+](https://www.python.org/)
- [Trivy](https://aquasecurity.github.io/trivy/latest/getting-started/installation/) (Optional, for security audits)

---

### 1. Cluster Initialization

Start Minikube and enable the metrics-server (required for resource monitoring):

```bash
# Start Minikube
minikube start --cpus 4 --memory 8192

# Enable Metrics Server
minikube addons enable metrics-server

# Verify the cluster is running
kubectl get nodes
```

### 2. Microservices Deployment

Deploy Google's **Online Boutique** microservices to create a realistic production-like environment:

```bash
kubectl apply -f k8s/online-boutique.yaml

# Wait for all pods to be ready
kubectl get pods --watch
```

### 3. Backend Setup

The backend is a FastAPI server that handles the agentic reasoning loop.

```bash
# Navigate to project root
cd H2H-Latency-Legends-KubeAssist

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Create a .env file in the root directory
echo "GOOGLE_API_KEY=your_api_key_here" > .env
echo "PORT=8110" >> .env
echo "ALLOWED_ORIGINS=http://localhost:5173" >> .env

# Run the backend
python -m backend.main
```

### 4. Frontend Setup

The frontend is a React-based dashboard with a visual cluster map.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create a .env file in the frontend directory
echo "VITE_API_URL=http://localhost:8110" > .env

# Run the frontend
npm run dev
```

---

## 🛠️ Key Features & Workflows

### 🔍 One-Shot Audit
Aggregates full cluster context (Security, Performance, Config) and uses Gemini to analyze all signals simultaneously. The results are categorized into actionable reports with one-click GitOps remediation paths.

### 🩺 Reactive Troubleshooting
When an incident occurs (e.g., a Pod crashing), select the Pod in the **Cluster Map**. KubeAssist will automatically stream logs, metrics, and events to identify the root cause using its cross-signal correlation engine.

### 🛡️ Fault Injection (For Testing)
Test KubeAssist's diagnostic capabilities by injecting real-world faults:

```bash
# Example: Inject an OOMKill fault into the paymentservice
kubectl apply -f backend/faults/oom-kill.yaml
```

---

## 🏗️ System Architecture

1.  **Reasoning Engine (LangGraph + Gemini 2.5 Flash):** A stateful agentic loop that plans investigations and evaluates telemetry.
2.  **Operational Intelligence Layers:** A dynamic frontend map that visualizes microservices topology and streams live telemetry.
3.  **GitOps Remediation:** Instead of direct cluster mutations, the agent drafts surgical Git diffs for human approval, ensuring system integrity.

---

## 📂 Project Structure

- `backend/agents/`: LangGraph workflows and reasoning logic.
- `backend/tools/`: Custom wrappers for `kubectl`, `metrics`, and `GitOps`.
- `backend/faults/`: YAML manifests for simulating production failures.
- `frontend/src/App.tsx`: Unified dashboard managing Map and Assistant modes.
- `k8s/`: Base manifests for the microservices environment.

---
*Built for the H2H-Latency-Legends Hackathon.*
