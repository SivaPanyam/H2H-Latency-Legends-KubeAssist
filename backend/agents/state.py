from typing import Annotated, Sequence, TypedDict, List, Dict, Any, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    The state of the KubeAssist agent.
    """
    messages: Annotated[Sequence[BaseMessage], add_messages]
    executed_commands: List[str]
    observations: List[str]
    plan: List[str]
    target_resource: Optional[Dict[str, str]]
    diagnosis: Optional[Dict[str, Any]]
