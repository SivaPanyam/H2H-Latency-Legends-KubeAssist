from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, SystemMessage
from backend.agents.workflow import app as agent_app, llm
from backend.tools.scanner import ClusterScanner
from typing import List, Dict, Any, Optional
import json
import concurrent.futures

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

class QueryRequest(BaseModel):
    query: str
    namespace: str = "default"

class ClusterIssue(BaseModel):
    id: str = Field(description="Unique ID for the issue")
    category: str = Field(description="Category of the issue (Security, Performance, Configuration, Lifecycle)")
    severity: str = Field(description="Severity (Critical, High, Medium, Low)")
    resource: str = Field(description="Target K8s resource (e.g. Pod/paymentservice)")
    description: str = Field(description="Short description of the problem")
    root_cause: str = Field(description="Identified root cause")
    suggested_fix: str = Field(description="Step-by-step fix guide")
    patch_data: Optional[Dict[str, Any]] = Field(description="JSON patch data for GitOps remediation if applicable")

class AuditReport(BaseModel):
    summary: str
    issues: List[ClusterIssue]

@router.get("/")
async def root():
    return {"message": "Welcome to KubeAssist API"}

@router.post("/api/scan-cluster")
async def scan_cluster(namespace: str = "default"):
    """Performs a comprehensive one-shot cluster audit."""
    await manager.broadcast({"type": "info", "message": "🔍 Initiating full cluster scan..."})
    
    scanner = ClusterScanner(namespace=namespace)
    context_data = scanner.get_full_cluster_context()
    
    await manager.broadcast({"type": "info", "message": "🧠 Analyzing cluster context with Gemini 1.5 Pro..."})
    
    system_prompt = """You are a Senior K8s SRE & Security Auditor. 
Analyze the provided cluster context (Resources, Metrics, Security scans) and identify ALL issues.
Categorize them into Security, Performance, Configuration, or Lifecycle.
Provide a structured JSON output representing the Audit Report.
Be specific about root causes and provide actionable 'patch_data' for GitOps remediation (fixing memory limits, resource requests, security contexts, etc.).
Ensure 'patch_data' matches the format expected by the GitOpsToolbox.
"""
    
    # Use structured output parsing
    structured_llm = llm.with_structured_output(AuditReport)
    
    try:
        # We send the massive context as a single prompt
        report = await structured_llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Cluster Context: {json.dumps(context_data, default=str)}")
        ])
        
        await manager.broadcast({"type": "info", "message": f"✅ Audit complete. Found {len(report.issues)} issues."})
        return report
    except Exception as e:
        error_msg = f"❌ Error during one-shot audit: {str(e)}"
        await manager.broadcast({"type": "info", "message": error_msg})
        return {"error": str(e)}

@router.post("/api/query")
async def process_query(request: QueryRequest):
    # Initial state for the agent
    initial_state = {
        "messages": [HumanMessage(content=request.query)],
        "executed_commands": [],
        "observations": [],
        "plan": [],
        "target_resource": None,
        "diagnosis": None
    }
    
    await manager.broadcast({"type": "info", "message": "🧠 Starting reasoning cycle..."})
    
    try:
        final_state = None
        # Stream the agentic loop
        async for event in agent_app.astream(initial_state, stream_mode="updates"):
            for node_name, output in event.items():
                if node_name == "reasoner":
                    msg = output["messages"][-1]
                    # If it's a tool call, broadcast the intent
                    if hasattr(msg, "tool_calls") and msg.tool_calls:
                        for tool_call in msg.tool_calls:
                            tool_name = tool_call.get("name")
                            await manager.broadcast({
                                "type": "info", 
                                "message": f"🤖 Agent decided to use tool: {tool_name}"
                            })
                    
                    # Update cluster map if target resource changed
                    if output.get("target_resource"):
                        resource_name = output["target_resource"]["name"]
                        await manager.broadcast({
                            "type": "update_map", 
                            "resource": resource_name
                        })
                elif node_name == "tools":
                    await manager.broadcast({
                        "type": "info", 
                        "message": "🛠️ Tools executed. Processing observations..."
                    })
            
            # Keep track of the latest state
            final_state = event

        await manager.broadcast({"type": "info", "message": "✅ Reasoning cycle complete."})
        
        # Get the very last state's message
        if final_state and "reasoner" in final_state:
            return {"response": final_state["reasoner"]["messages"][-1].content}
        
        return {"response": "I have completed my investigation. Please see the logs for details."}
        
    except Exception as e:
        error_msg = f"❌ Error during reasoning: {str(e)}"
        await manager.broadcast({"type": "info", "message": error_msg})
        return {"response": f"I encountered an error: {str(e)}"}

@router.post("/api/apply-fix")
async def apply_fix(issue: ClusterIssue):
    """Generates a GitOps Pull Request for a specific identified issue."""
    from backend.tools.gitops_toolbox import GitOpsToolbox
    
    if not issue.patch_data:
        return {"success": False, "error": "No patch data available for this issue."}
    
    await manager.broadcast({"type": "info", "message": f"🛠️ Generating GitOps fix for {issue.resource}..."})
    
    gitops = GitOpsToolbox()
    # Assume resource is in format 'Type/Name'
    try:
        res_type, res_name = issue.resource.split("/")
    except ValueError:
        # Fallback for pods
        res_type, res_name = "Deployment", issue.resource # Most fixes are on deployments
        
    diff_res = gitops.generate_patch_diff(res_type, res_name, issue.patch_data)
    
    if diff_res["success"]:
        pr_res = gitops.propose_pull_request(
            title=f"Fix: {issue.description}",
            description=f"Automated fix for {issue.category} issue in {issue.resource}.\nRoot Cause: {issue.root_cause}",
            diff_content=diff_res["diff"]
        )
        await manager.broadcast({"type": "info", "message": f"✅ Pull Request proposed for {issue.resource}."})
        return pr_res
    else:
        await manager.broadcast({"type": "info", "message": f"❌ Failed to generate fix: {diff_res['error']}"})
        return diff_res

@router.get("/api/pod-details/{pod_name}")
async def get_pod_details(pod_name: str, namespace: str = "default"):
    """Fetches real-time details and metrics for a specific pod, resolving the full pod name if needed."""
    from backend.tools.kubectl_toolbox import KubectlToolbox
    kube = KubectlToolbox()
    
    # Resolve the full pod name if the provided name is a service prefix
    pods_res = kube.get_pods(namespace)
    actual_pod_name = pod_name
    if pods_res["success"]:
        for pod in pods_res["output"].get("items", []):
            name = pod["metadata"]["name"]
            if name.startswith(pod_name):
                actual_pod_name = name
                break

    # We gather data in parallel for responsiveness
    with concurrent.futures.ThreadPoolExecutor() as executor:
        f_desc = executor.submit(kube.describe_pod, actual_pod_name, namespace)
        f_logs = executor.submit(kube.get_logs, actual_pod_name, namespace, tail=20)
        f_top = executor.submit(kube.top_pods, namespace)
    
    desc = f_desc.result()
    logs = f_logs.result()
    top = f_top.result()
    
    # Extract specific metrics from top output if available
    metrics = {"cpu": "N/A", "memory": "N/A"}
    if top["success"]:
        for line in top["output"].splitlines():
            if actual_pod_name in line:
                parts = line.split()
                if len(parts) >= 3:
                    metrics["cpu"] = parts[1]
                    metrics["memory"] = parts[2]

    return {
        "name": actual_pod_name,
        "status": "Running",
        "metrics": metrics,
        "logs": logs["output"] if logs["success"] else f"Error fetching logs: {logs.get('error', 'Unknown error')}",
        "events": desc["output"] if desc["success"] else f"Error fetching description: {desc.get('error', 'Unknown error')}"
    }

@router.get("/api/performance")
async def get_performance(namespace: str = "default"):
    """Gathers cluster-wide performance metrics for the operations dashboard."""
    from backend.tools.kubectl_toolbox import KubectlToolbox
    kube = KubectlToolbox()
    
    nodes_top = kube._run_cmd(["kubectl", "top", "nodes"])
    pods_top = kube.top_pods(namespace)
    
    top_consumers = []
    if pods_top["success"]:
        lines = pods_top["output"].splitlines()[1:] # Skip header
        for line in lines:
            parts = line.split()
            if len(parts) >= 3:
                top_consumers.append({
                    "name": parts[0],
                    "cpu": parts[1],
                    "memory": parts[2]
                })
        # Sort by CPU (simple heuristic)
        top_consumers = sorted(top_consumers, key=lambda x: x["cpu"], reverse=True)[:5]

    return {
        "node_metrics": nodes_top["output"] if nodes_top["success"] else "N/A",
        "top_pods": top_consumers,
        "timestamp": "Real-time"
    }

@router.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"type": "info", "message": f"Client connected and sent query length: {len(data)}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
