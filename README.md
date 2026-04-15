# KubeAssist: Agentic AI Ops Assistant for Kubernetes Clusters
🚀 **Your intelligent autopilot for Kubernetes troubleshooting, root cause analysis, and remediation.**

## 🛑 The Problem
Kubernetes is powerful but notoriously complex. When a deployment fails, a pod enters `CrashLoopBackOff`, or network latency spikes, DevOps and SRE teams are forced into a stressful hunt. They have to sift through endless logs, decode metric dashboards, and juggle multiple `kubectl` commands just to diagnose the issue—let alone fix it. This manual debugging process is slow, error-prone, and leads to costly downtime.

## 💡 The Solution
**KubeAssist** is an AI-powered command-line and web assistant designed to monitor, diagnose, and fix Kubernetes cluster issues autonomously. Simply ask KubeAssist what's wrong in plain English. The agent translates your natural language queries into `kubectl` commands, executes them, analyzes the logs and outputs, identifies the root cause, and provides actionable, step-by-step fix recommendations.

---

## 🏗️ Architecture

KubeAssist is built with a modular, agent-centric architecture:

*   **User Interface (CLI/Web):** A sleek, intuitive interface allowing users to chat with the cluster in natural language and receive formatted diagnostics.
*   **AI Agent (LLM + Reasoning):** Powered by an advanced LLM and orchestrated via an agent framework (e.g., LangGraph/CrewAI). It plans debugging steps, evaluates conditions, and decisions which tools to call.
*   **Tool Layer:** A secure wrapper around `kubectl`, cluster logs, and metrics APIs. The agent uses these tools to inspect the cluster state dynamically.
*   **Kubernetes Cluster:** The target environment (e.g., Minikube or kind) populated with microservices, where KubeAssist actively monitors state and performs diagnostics.

---

## ✨ Features
*   🗣️ **Natural Language Queries:** Ask "Why is my database pod crashing?" and get a direct answer.
*   🤖 **Autonomous `kubectl` Execution:** The agent writes, safely executes, and interprets standard `kubectl` commands on the fly.
*   🔍 **Root Cause Analysis (RCA):** Deep log and event analysis automatically pinpoints exactly *why* a failure occurred.
*   🛠️ **Fix Recommendations:** Generates clear, copy-pasteable command snippets to resolve the issue.
*   🧠 **Multi-Turn Conversation Memory:** Remembers context, so you can ask follow-up questions like "Can you check the logs for that specific pod instead?"
*   📝 **Transparent Reasoning Logs:** View the exact chain of thought and `kubectl` commands the AI ran to ensure trust and understandability.

---

## 🛠️ Tech Stack
*   **LLM Engine:** Ollama / Gemini / OpenAI
*   **Agent Framework:** LangGraph / LangChain
*   **Backend:** Python / FastAPI
*   **Kubernetes Environment:** Minikube / kind

---

## 📁 Project Structure

```text
KubeAssist/
├── backend/
│   ├── agent.py          # LangGraph/CrewAI agent definitions
│   ├── tools.py          # kubectl and cluster interaction wrappers
│   ├── main.py           # FastAPI entry point
│   └── requirements.txt  # Python dependencies
├── k8s/
│   ├── apps/             # Sample microservices manifests
│   └── faults/           # Broken manifests for testing
├── web/                  # Web UI / CLI dashboard code
└── README.md             # Project documentation
```

---

## 🚀 Setup Instructions

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/KubeAssist.git
    cd KubeAssist
    ```

2.  **Start Kubernetes Cluster**
    ```bash
    minikube start
    ```

3.  **Deploy Sample Microservices**
    ```bash
    kubectl apply -f k8s/apps/
    ```

4.  **Install Dependencies**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

5.  **Run the Backend & Agent**
    ```bash
    uvicorn main:app --reload
    ```

6.  **Run KubeAssist Interface**
    ```bash
    # Open a new terminal and start the CLI or Web UI
    python cli.py
    ```

---

## 🧪 Fault Injection Simulation

To demonstrate KubeAssist’s power, you can artificially inject issues into the cluster:

*   **CrashLoopBackOff:**
    ```bash
    kubectl apply -f k8s/faults/crash-pod.yaml
    ```
    *(A pod with a deliberately failing entrypoint script)*

*   **Misconfigurations (ImagePullBackOff):**
    ```bash
    kubectl apply -f k8s/faults/invalid-image.yaml
    ```
    *(A deployment referencing a non-existent Docker image)*

*   **Pending Pods:**
    ```bash
    kubectl apply -f k8s/faults/resource-starved.yaml
    ```
    *(A pod requesting more CPU/Memory than the cluster has available)*

---

## 💬 Example Usage

You can talk to KubeAssist just like a senior SRE.

**User:**
> "Why is my payment-service pod not running?"

**User:**
> "Check the logs for the redis-cache service."

**User:**
> "My web frontend is stuck in ImagePullBackOff, how do I fix this?"

---

## 📊 Sample Output Format

When KubeAssist diagnoses an issue, it responds with a clear, structured format:

**Issue:** `payment-service-deployment-abc` is experiencing a `CrashLoopBackOff`.

**Root Cause:** The application is attempting to connect to a database at `db-svc:5432`, but the connection is timing out. The container logs show `FATAL: password authentication failed for user "admin"`.

**Fix:** Update the `payment-secret` Kubernetes Secret with the correct database password, or check the deployment environment variables.
*Suggested Command:*
```bash
kubectl edit secret payment-secret
```

**Confidence:** 🟢 High (95%)

---

## 🔎 Logging & Transparency

Trust is critical in Ops. KubeAssist doesn't hide its work inside a black box. The UI includes an expandable "Agent Reasoning" log that streams every action in real-time:
*   ✅ **Thought:** *I need to check the pod's current state.*
*   ⚙️ **Action:** Executing `kubectl get pods -l app=payment-service`
*   ✅ **Thought:** *The pod is crashing, I will pull the logs from the previous container instance.*
*   ⚙️ **Action:** Executing `kubectl logs <pod-name> --previous`

This ensures DevOps engineers maintain complete oversight of what the agent is investigating.

---

## 🎬 Demo

The provided project demo walks through 5 complete diagnostic conversations, tackling the most common Kubernetes headaches:
1.  Debugging a `CrashLoopBackOff` from a missing environment variable.
2.  Resolving an `ImagePullBackOff` due to a typo in the manifest.
3.  Investigating a `Pending` pod caused by insufficient node resources.
4.  Troubleshooting service discovery / DNS failure between two microservices.
5.  Analyzing application-level stack traces dynamically pulled from `kubectl logs`.

---

## 📈 Scalability Discussion

While this hackathon project runs on Minikube, the architecture is designed for production scale:
*   **200+ Services:** The agent strictly filters queries using label selectors and namespaces rather than pulling the entire cluster state, ensuring low latency.
*   **Prometheus Integration:** The tool layer can easily be expanded to query Prometheus APIs (PromQL), allowing the agent to analyze historical metrics, memory leaks, and CPU throttling.
*   **Async Agents:** Designed to support asynchronous multi-agent collaboration, allowing dedicated agents for specific tasks (e.g., a "Network Agent" and a "Storage Agent") to confer on complex issues without blocking.

---

## 🔮 Future Improvements

*   **Auto-Fix Mode:** Allow the agent to not just recommend fixes, but automatically apply non-destructive patches (with an undo feature).
*   **Visual Dashboard:** Provide a comprehensive web dashboard with real-time topological maps of the cluster alongside the chat interface.
*   **Multi-Agent System:** Deploy specialized agents that collaborate (e.g., Security Agent, Performance Agent) for deeper, specialized analysis at scale.

---

## 🏁 Conclusion

KubeAssist bridges the gap between complex Kubernetes infrastructure and intuitive operations. By turning natural language into actionable diagnostics and remediation, we help teams resolve outages faster, reduce fatigue, and keep their systems highly available. Say goodbye to endless `kubectl` scrolling and let AI do the heavy lifting!