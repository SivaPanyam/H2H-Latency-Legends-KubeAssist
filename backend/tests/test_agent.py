import os
import sys
import pytest
from unittest.mock import MagicMock, patch

# Add the project root (the directory containing 'backend') to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__)) # backend/tests
project_root = os.path.dirname(os.path.dirname(current_dir)) # H2H-Latency-Legends-KubeAssist
sys.path.insert(0, project_root)

from backend.agents.workflow import app as agent_app
from langchain_core.messages import HumanMessage, AIMessage

def test_workflow_initialization():
    """Verify that the agent workflow app is correctly initialized."""
    assert agent_app is not None

@patch("langchain_google_genai.chat_models.ChatGoogleGenerativeAI.invoke")
def test_reasoner_node_calls_llm(mock_invoke):
    """Verify that the reasoner node correctly calls the LLM."""
    mock_invoke.return_value = AIMessage(content="I should check pods.")
    
    from backend.agents.workflow import reasoner_node
    from backend.agents.state import AgentState
    
    state: AgentState = {
        "messages": [HumanMessage(content="What's wrong with the cluster?")],
        "executed_commands": [],
        "observations": [],
        "plan": [],
        "target_resource": None,
        "diagnosis": None
    }
    
    result = reasoner_node(state)
    assert len(result["messages"]) == 1
    assert result["messages"][0].content == "I should check pods."
    mock_invoke.assert_called_once()

def test_should_continue_logic():
    """Verify the conditional edge logic."""
    from backend.agents.workflow import should_continue
    from backend.agents.state import AgentState
    
    # Case 1: Should continue to tools
    from langchain_core.messages import AIMessage
    msg = AIMessage(content="call tool", tool_calls=[{"name": "get_pods", "args": {}, "id": "1"}])
    state_tools: AgentState = {
        "messages": [msg]
    }
    assert should_continue(state_tools) == "tools"
    
    # Case 2: Should end
    state_end: AgentState = {
        "messages": [AIMessage(content="Final diagnosis: everything is fine.")]
    }
    assert should_continue(state_end) == "__end__"
