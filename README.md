# ☸️ KubeAssist: Agentic AI Ops Assistant for Kubernetes

> **An AI-powered web assistant designed to monitor, diagnose, and remediate local Kubernetes clusters using natural language.**

---

## 📖 Overview
KubeAssist is a specialized AI agent that acts as an "Autopilot" for Kubernetes SREs. It accepts natural language queries, autonomously gathers cluster data using `kubectl`, reasons over the output, and provides actionable root-cause summaries and fixes.

This project is built to satisfy the **Agentic AI Ops Assistant for Kubernetes Clusters** challenge, featuring a full agentic loop, fault injection scenarios, and a transparent reasoning web interface.

---

## 🎯 Problem Statement
Managing complex microservices on Kubernetes often leads to "Alert Fatigue." When a service fails, engineers must manually execute dozens of commands to find the root cause. **KubeAssist** automates this diagnostic journey by translating intent into action.

---

## 🏗️ Architecture & Scope
KubeAssist is built with a focus on **Transparency** and **Autonomy**:

1.  **Web Interface (React):** A dashboard to chat with the agent and view the "Thought Stream" (real-time tool calls and reasoning).
2.  **Agentic Loop (LangGraph):** A stateful ReAct loop that plans debugging steps, executes tools, and evaluates observations.
3.  **Tool Layer:** Custom Python wrappers for `kubectl` that return structured data for the LLM to process.
4.  **Local Cluster:** Minikube/kind running **Google’s Online Boutique** microservices.
5.  **Fault Injection Engine:** Scripts to simulate `CrashLoopBackOff`, resource exhaustion, and pending pods.

---

## 🚀 Key Features
- **Natural Language to Kubectl:** Translates "Why is the cart service slow?" into precise diagnostic commands.
- **Autonomous Reasoning:** The agent doesn't just run one command; it investigates recursively until it finds a root cause.
- **Multi-turn Conversation:** Maintains context across questions (e.g., "What about the other namespace?").
- **Full Transparency Logs:** Every tool call and internal "thought" is displayed in the Web UI.
- **Actionable Fixes:** Provides the exact `kubectl` commands needed to resolve the detected issue.

---

## 🛠️ Tech Stack
- **LLM:** Google Gemini 1.5 Pro / Ollama
- **Orchestration:** LangGraph (for complex stateful reasoning)
- **Backend:** Python + FastAPI (Streaming WebSockets for logs)
- **Frontend:** React + Tailwind CSS
- **K8s Environment:** Minikube / kind + Google Online Boutique

---

## 🗓️ 6-Day Implementation Plan

### **Day 1: Cluster Setup & Fault Injection**
- [ ] Setup Minikube and deploy **Google’s Online Boutique**.
- [ ] Create `faults/` directory with YAMLs for: `CrashLoopBackOff`, `Pending` pods, and `OOMKilled`.
- [ ] Verify cluster health and manual troubleshooting steps.

### **Day 2: Backend Infrastructure & Tooling**
- [ ] Setup FastAPI server with WebSocket support.
- [ ] Build the `KubectlToolbox`: Python wrappers for `get`, `describe`, `logs`, and `top`.
- [ ] Implement input sanitization to prevent destructive commands without approval.

### **Day 3: The Agentic Loop (LangGraph)**
- [ ] Define the LangGraph `State` (messages, tool_outputs, current_step).
- [ ] Create the **Diagnostic Node**: Logic to analyze `kubectl` output and decide next steps.
- [ ] Connect LLM (Gemini) to the tool-calling loop.

### **Day 4: Web Interface (The Command Center)**
- [ ] Build a React Chat UI.
- [ ] Implement the **"Reasoning Stream"**: A side panel that shows exactly what `kubectl` commands the agent is running in real-time.
- [ ] Add a **Cluster Overview** component showing pod status.

### **Day 5: Context & Conversation Memory**
- [ ] Implement persistence for chat history using LangGraph's `Checkpointer`.
- [ ] Refine prompts to handle follow-up questions and cross-namespace queries.
- [ ] Test the "5 distinct diagnostic conversations" requirement.

### **Day 6: Deliverables & Final Polish**
- [ ] Record the **Working Demo** showing 5 scenarios.
- [ ] Write the **One-page Report**: "What worked, what didn't, and production scaling (200+ services)".
- [ ] Finalize `README.md` and push source code.

---

## 📁 Project Structure
```text
KubeAssist/
├── backend/
│   ├── agents/             # LangGraph workflows
│   ├── tools/              # Kubectl wrappers
│   ├── faults/             # Fault injection scripts
│   └── api/                # FastAPI & WebSockets
├── frontend/               # React UI & Log Streamer
├── k8s/                    # Online Boutique Manifests
├── docs/                   # One-page write-up & Demo notes
└── README.md
```

---

## 🏁 Deliverables (Coming Soon)
- [ ] **Working Demo:** Screen recording of 5 diagnostic scenarios.
- [ ] **Source Code:** Full repository with setup instructions.
- [ ] **Technical Write-up:** Analysis of scaling to 200+ services.

---
*Built for the H2H-Latency-Legends Hackathon.*
