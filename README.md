# ☸️ KubeAssist: Agentic AI Ops Assistant for Kubernetes

> **Your intelligent autopilot for Kubernetes troubleshooting, root cause analysis, and remediation.**

---

## 🛑 The Problem: Kubernetes Complexity
Kubernetes is the backbone of modern infrastructure, but it is notoriously complex. When a deployment fails or a pod is stuck, SREs and DevOps engineers are forced into a high-stress "manual hunt"—sifting through fragmented logs, decoding cryptic `kubectl` outputs, and jumping between dashboards. This process is slow, error-prone, and leads to costly downtime.

## 💡 The Solution: KubeAssist
**KubeAssist** bridges the gap between natural language and cluster management. It is an AI-powered assistant that understands your cluster's state. By simply asking, *"Why is my payment service failing?"*, KubeAssist autonomously explores your cluster, identifies the root cause, and provides step-by-step fix recommendations.

---

## 🏗️ Architecture
KubeAssist is built with a modular, agent-centric architecture designed for transparency and safety.

*   **User Interface (CLI/Web):** A sleek interface for natural language interaction and real-time "thought-stream" visualization.
*   **AI Agent (LLM + Reasoning):** Powered by LangGraph, the agent uses cyclic reasoning (Plan → Act → Observe) to diagnose issues.
*   **Tool Layer:** A secure wrapper around the Kubernetes API, `kubectl`, and logs that provides structured JSON data to the agent.
*   **Environment:** A target Kubernetes cluster (Minikube/kind) populated with microservices and simulated faults.

---

## 🚀 Advanced Features
- **Natural Language Queries:** No more memorizing complex `kubectl` flags.
- **Autonomous Root Cause Analysis (RCA):** Connects the dots between logs, events, and metrics to find the "Why".
- **Self-Healing Recommendations:** Generates precise `kubectl apply` or `patch` commands with safety checks.
- **Resource Optimization:** Identifies over-provisioned or throttled containers and suggests right-sizing.
- **Security Guardrails:** Detects exposed secrets, privileged containers, and misconfigured RBAC.
- **Multi-turn Memory:** Remembers previous debugging steps for deep-dive sessions.
- **Transparent Thought-Stream:** Real-time logging of the agent's internal reasoning and tool calls.

---

## 🛠️ Tech Stack
- **LLM Engine:** Google Gemini 1.5 Pro / OpenAI GPT-4o
- **Agent Framework:** LangGraph (Stateful Orchestration)
- **Backend:** Python 3.11 / FastAPI
- **Infrastructure:** Kubernetes (Minikube / kind)
- **Frontend:** React + Tailwind CSS + WebSockets

---

## 🗓️ 6-Day Implementation Plan

### **Day 1: Foundation & LLM Integration**
*   **Goal:** Setup core backend and LLM connection.
*   **Tasks:** Initialize FastAPI structure; Implement `LLMService` for structured JSON output; Create basic `kubectl` read-only tool wrappers.

### **Day 2: Advanced Observation & Tooling**
*   **Goal:** Enable the agent to see the cluster state comprehensively.
*   **Tasks:** Build tools for `describe`, `logs`, and `top`; Implement a "Cluster Context Provider" to auto-attach namespace info; Setup a local `kind` cluster with sample apps.

### **Day 3: Agentic Logic with LangGraph**
*   **Goal:** Implement the "Thinking" loop.
*   **Tasks:** Define LangGraph `State` (plan, history, observations); Build the **Supervisor Node** (Planner) and **Tool Node** (Executor); Implement the cyclic reasoning loop.

### **Day 4: Domain Expertise & RCA Modules**
*   **Goal:** Teach the agent to recognize specific failure patterns.
*   **Tasks:** Implement specialized logic for `CrashLoopBackOff`, `OOMKilled`, and `Pending` pods; Build the "Fix Generator" with confidence scoring.

### **Day 5: Real-time UI & WebSocket Streaming**
*   **Goal:** Build the visualization layer.
*   **Tasks:** Develop the React Chat UI; Implement WebSockets to stream the agent's "Thought-Stream" in real-time; Add "Human-in-the-Loop" approval for fixes.

### **Day 6: Validation, Hardening & Demo**
*   **Goal:** Ensure robustness and finalize the project.
*   **Tasks:** Run "Fault Injection" suite (10 scenarios); Implement command validation (prevent hallucinations); Record demo and finalize documentation.

---

## 📁 Project Structure
```text
KubeAssist/
├── backend/
│   ├── agents/             # LangGraph state machine & logic
│   ├── tools/              # Kubectl & API wrappers
│   ├── api/                # FastAPI endpoints
│   └── main.py             # Entry point
├── frontend/               # React-based Web UI
├── cli/                    # Python-based CLI tool
├── k8s/
│   ├── base-apps/          # Healthy microservices
│   └── fault-injection/    # YAMLs for broken states
├── scripts/                # Setup & cluster management
└── README.md
```

---

## 🧪 Fault Injection Examples
Simulate real-world failures to test KubeAssist's diagnostic precision:
- **CrashLoopBackOff:** `kubectl apply -f k8s/fault-injection/crash-loop.yaml`
- **Resource Exhaustion:** `kubectl apply -f k8s/fault-injection/oom-kill.yaml`
- **Network Latency:** `kubectl apply -f k8s/fault-injection/service-latency.yaml`

---

## 📊 Sample Output Format
```json
{
  "issue": "Pod 'auth-service' is not running.",
  "status": "ImagePullBackOff",
  "root_cause": "The deployment is referencing 'auth-service:v1.2.9', but only 'v1.2.0' exists.",
  "fix": "kubectl set image deployment/auth-service auth=auth-service:v1.2.0",
  "confidence": 0.98
}
```

---

## 📈 Scalability & Future
- **Context Pruning:** Using RAG to feed only relevant logs to the LLM.
- **Enterprise Hooks:** Integration with Prometheus, Grafana, and ELK.
- **Auto-Remediation:** Full autonomous mode for dev clusters.

---

## 🏁 Conclusion
KubeAssist transforms Kubernetes from a complex "black box" into a conversational partner. By automating the cognitive load of debugging, we empower engineers to focus on building features rather than fighting infrastructure.

**KubeAssist: Debugging at the speed of thought.**
