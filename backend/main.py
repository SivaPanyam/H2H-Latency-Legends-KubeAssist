from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from backend.agents.workflow import app as agent_app
from langchain_core.messages import HumanMessage

app = FastAPI(title="KubeAssist API", description="AI Ops Assistant for Kubernetes")

class QueryRequest(BaseModel):
    query: str
    namespace: str = "default"

@app.get("/")
async def root():
    return {"message": "Welcome to KubeAssist API"}

@app.post("/api/query")
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
    
    # Run the agentic loop
    final_state = agent_app.invoke(initial_state)
    
    # Return the last message from the agent
    last_message = final_state["messages"][-1]
    return {"response": last_message.content}

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Stream the agent's internal reasoning
            await websocket.send_text(json.dumps({"type": "info", "message": f"KubeAssist is analyzing: {data}"}))
    except WebSocketDisconnect:
        print("Client disconnected")
