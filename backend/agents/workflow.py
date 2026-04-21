import os
from typing import Dict, Any, List, Literal, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from backend.agents.state import AgentState
from backend.agents.tools import all_tools

# Initialize LLM & Tools
api_key = os.getenv("GOOGLE_API_KEY") or "placeholder"
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, google_api_key=api_key)
llm_with_tools = llm.bind_tools(all_tools)

SYSTEM_PROMPT = """You are KubeAssist, a Production-Grade AI Ops Assistant.
Your goal is to monitor, diagnose, and remediate issues in a Kubernetes cluster.

REASONING GUIDELINES:
1. START by scanning the namespace to find unhealthy pods (Status != Running).
2. CORRELATE: If a pod is crashing, check logs AND events AND metrics (top_pods).
3. IDENTIFY: Find the exact root cause (e.g., OOM, Image Typo, Config Error).
4. REMEDIATE: 
   a. Propose a fix by generating a git diff using 'generate_fix_diff'.
   b. After verifying the diff is correct, propose a Pull Request using 'propose_pull_request'.
   c. DO NOT use kubectl apply. We follow GitOps "Shift-Left" practices.

When you have found the root cause and proposed a fix via PR, respond with a FINAL DIAGNOSIS.
"""

def reasoner_node(state: AgentState):
    """
    Decides the next action (Investigate, Fix, or Final Diagnosis).
    """
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
    response = llm_with_tools.invoke(messages)
    
    # Try to extract a target resource from the tool calls
    target_resource = state.get("target_resource")
    if hasattr(response, "tool_calls") and response.tool_calls:
        for tool_call in response.tool_calls:
            args = tool_call.get("args", {})
            if "pod_name" in args:
                target_resource = {"type": "pod", "name": args["pod_name"]}
            elif "resource_name" in args:
                target_resource = {"type": "resource", "name": args["resource_name"]}
    
    return {
        "messages": [response],
        "target_resource": target_resource
    }

# Define the Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("reasoner", reasoner_node)
workflow.add_node("tools", ToolNode(all_tools))

# Add Edges
workflow.add_edge(START, "reasoner")

def should_continue(state: AgentState) -> Literal["tools", "end"]:
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "end"

workflow.add_conditional_edges(
    "reasoner", 
    should_continue,
    {
        "tools": "tools",
        "end": END
    }
)
workflow.add_edge("tools", "reasoner")

# Compile
app = workflow.compile()
