import os
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from backend.agents.state import AgentState
from backend.tools.kubectl_toolbox import KubectlToolbox
from backend.tools.gitops_toolbox import GitOpsToolbox

# Initialize LLM & Tools
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)
kube_tools = KubectlToolbox()
gitops_tools = GitOpsToolbox()

SYSTEM_PROMPT = """You are KubeAssist, a Production-Grade AI Ops Assistant.
Your goal is to monitor, diagnose, and remediate issues in a Kubernetes cluster.

You have access to the following tools:
- get_pods(namespace): List all pods.
- describe_pod(pod_name, namespace): Get detailed pod info and events.
- get_logs(pod_name, namespace): Get recent pod logs.
- top_pods(namespace): Get CPU/Memory metrics.
- get_events(namespace): Get cluster-wide events.

REASONING GUIDELINES:
1. START by scanning the namespace to find unhealthy pods (Status != Running).
2. CORRELATE: If a pod is crashing, check logs AND events AND metrics (top_pods).
3. IDENTIFY: Find the exact root cause (e.g., OOM, Image Typo, Config Error).
4. REMEDIATE: Propose a fix using the GitOps approach.

When you have found the root cause and a fix, respond with a JSON-formatted diagnosis.
Otherwise, tell me which tool you want to run and why.
"""

def reasoner_node(state: AgentState):
    """
    Decides the next action (Investigate or Diagnose).
    """
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
    
    # In a real implementation, we would use tool-calling/bind_tools.
    # For this version, we will ask the LLM for a structured thought.
    response = llm.invoke(messages)
    
    # For now, we return the message and update history
    return {"messages": [response]}

def tool_node(state: AgentState):
    """
    Executes the command chosen by the reasoner.
    (Simplified logic: In Day 4 we will add complex tool routing)
    """
    # Placeholder for tool execution logic
    return state

# Define the Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("reasoner", reasoner_node)
workflow.add_node("tools", tool_node)

# Add Edges
workflow.set_entry_point("reasoner")
workflow.add_edge("tools", "reasoner")

# Conditional Logic: Decide whether to loop back to tools or end
def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if "FINAL DIAGNOSIS" in last_message.content or "fix" in last_message.content.lower():
        return END
    return "tools"

workflow.add_conditional_edges("reasoner", should_continue)

# Compile
app = workflow.compile()
