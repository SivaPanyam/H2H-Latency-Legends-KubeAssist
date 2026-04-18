# ☸️ KubeAssist: Agentic AI Ops Assistant for Kubernetes

> **A Production-Grade, AI-powered web assistant designed to monitor, diagnose, and remediate Kubernetes clusters through Cross-Signal Correlation and GitOps workflows.**

---

## 📖 Overview
KubeAssist is a specialized AI agent that acts as an "Autopilot" for Kubernetes SREs. It accepts natural language queries, autonomously gathers cluster data, reasons over the output using multiple signals (Logs, Metrics, Events), and provides actionable root-cause summaries and "Shift-Left" fixes.

This project is built to satisfy the **Agentic AI Ops Assistant for Kubernetes Clusters** challenge, going beyond basic chat by featuring a full agentic loop, fault injection scenarios, a visual reasoning web interface, and GitOps integration.

---

## 🎯 Problem Statement
Managing complex microservices on Kubernetes often leads to "Alert Fatigue." When a service fails, engineers must manually execute dozens of commands to find the root cause, often causing "Configuration Drift" when applying hotfixes. **KubeAssist** automates this diagnostic journey by translating intent into action and proposing codified fixes.

---

## 🏗️ Architecture & Scope
KubeAssist is built with a focus on **Transparency**, **Autonomy**, and **Production Readiness**:

1.  **Web Interface (React + React Flow):** A dashboard to chat with the agent, view the "Thought Stream", and see a live **Visual Cluster Map** that highlights nodes the agent is currently investigating.
2.  **Agentic Loop (LangGraph):** A stateful ReAct loop that plans debugging steps, executes tools, and evaluates observations.
3.  **Cross-Signal Correlation Engine:** The agent doesn't just read logs; it automatically cross-references Logs, Metrics (Prometheus/top), and Kubernetes Events to pinpoint exact failures.
4.  **Tool Layer:** Custom Python wrappers for `kubectl`, metrics APIs, and GitHub/GitLab PR generation.
5.  **Local Cluster:** Minikube/kind running **Google’s Online Boutique** microservices.

---

## 🚀 Unique Value Propositions (UVPs)
- **Visual Thought-Stream:** Watch the agent's brain work in real-time as it navigates a dynamic topology map of your cluster.
- **Cross-Signal Correlation:** Identifies complex issues like "Pod crashed due to hitting 128MB memory limit during a traffic spike" by correlating events and metrics.
- **"Shift-Left" Remediation (GitOps):** Prevents configuration drift. Instead of blindly running `kubectl apply`, KubeAssist drafts a Pull Request with the fix (e.g., bumping memory limits) for human approval.
- **Natural Language to Kubectl:** Translates complex intents into precise diagnostic commands.

---

## 🛠️ Tech Stack
- **LLM:** Google Gemini 1.5 Pro / Ollama
- **Orchestration:** LangGraph (for complex stateful reasoning)
- **Backend:** Python + FastAPI (Streaming WebSockets for logs)
- **Frontend:** React + Tailwind CSS + React Flow (for cluster visualization)
- **K8s Environment:** Minikube / kind + Google Online Boutique

---

## 🗓️ 6-Day Implementation Plan

### **Day 1: Cluster Setup & Fault Injection (Completed ✅)**
- [x] **Cluster Initialization:** Successfully set up Minikube with the Windows x64 environment.
- [x] **Microservices Deployment:** Deployed the full "Google Online Boutique" (11 microservices) for realistic diagnostic testing.
- [x] **Fault Suite Creation:** Developed YAML scenarios for `CrashLoopBackOff` (cartservice), `OOMKilled` (paymentservice), and `Pending` pods (adservice).
- [x] **Health Check:** Verified all baseline services reached a "Running" state before fault injection.

### **Day 2: Backend Infrastructure & Cross-Signal Tooling (Completed ✅)**
- [x] **FastAPI Core:** Developed the backend server with WebSocket support for real-time "Thought-Stream" visualization.
- [x] **KubectlToolbox:** Implemented secure Python wrappers for `get pods`, `describe`, `logs`, `events`, and `top pods` (for metric-based correlation).
- [x] **GitOpsToolbox:** Built a "Shift-Left" remediation tool to draft Git diffs and Pull Requests for human-approved fixes.
- [x] **Enterprise Frontend Foundation:** Initialized a React + Vite + Tailwind CSS dashboard with a professional Operations Center layout.

### **Day 3: The Agentic Loop (LangGraph) & Correlation Engine**
- [ ] Define the LangGraph `State` (messages, tool_outputs, current_step).
- [ ] Create the **Diagnostic Node**: Logic to analyze `kubectl` output and decide next steps.
- [ ] Implement the **Correlation Logic**: Prompting the LLM to verify findings across logs, metrics, and events.

### **Day 4: "Shift-Left" GitOps Remediation**
- [ ] Build the `GitOpsToolbox`: Ability to read local YAMLs and propose patches.
- [ ] Implement the "Fix Generator" that outputs a `git diff` or proposes a Pull Request instead of a direct `kubectl apply`.
- [ ] Refine the agent's confidence scoring before proposing a fix.

### **Day 5: Web Interface (The Command Center & Visual Map)**
- [ ] Build the React Chat UI with a real-time **"Reasoning Stream"** side panel.
- [ ] Implement a **Live Cluster Map** (using React Flow or D3) that visually highlights pods/services as the agent queries them.
- [ ] Integrate WebSocket streaming from the FastAPI backend.

### **Day 6: Deliverables & Final Polish**
- [ ] Record the **Working Demo** showing 5 scenarios, including the visual map and GitOps PR proposal.
- [ ] Write the **One-page Report**: "What worked, what didn't, and production scaling (200+ services)".
- [ ] Finalize `README.md` and push source code.

---

## 📁 Project Structure
```text
KubeAssist/
├── backend/
│   ├── agents/             # LangGraph workflows & Correlation Engine
│   ├── tools/              # Kubectl, Metrics, and GitOps wrappers
│   ├── faults/             # Fault injection scripts
│   ├── api/                # FastAPI & WebSockets
│   └── main.py             # FastAPI entry point
├── frontend/               # React UI, Log Streamer, and Visual Map
├── k8s/                    # Online Boutique Manifests
├── docs/                   # One-page write-up & Demo notes
└── README.md
```

---
*Built for the H2H-Latency-Legends Hackathon.*
