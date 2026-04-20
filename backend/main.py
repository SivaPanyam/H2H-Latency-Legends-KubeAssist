from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from backend.agents.workflow import app as agent_app
from langchain_core.messages import HumanMessage

app = FastAPI(title="KubeAssist API", description="AI Ops Assistant for Kubernetes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    await manager.broadcast({"type": "info", "message": "Starting reasoning cycle..."})
    
    # Run the agentic loop with async stream
    final_state = None
    async for event in agent_app.astream(initial_state):
        for node_name, state_update in event.items():
            # Send general node execution update
            await manager.broadcast({
                "type": "info",
                "message": f"Executing step: {node_name}"
            })
            
            # If target_resource is updated, broadcast it for the Cluster Map
            if "target_resource" in state_update and state_update["target_resource"]:
                resource = state_update["target_resource"]
                await manager.broadcast({
                    "type": "update_map",
                    "resource": resource.get("name") or resource.get("pod_name") or resource.get("service_name")
                })
            
            if node_name == "tools" and "messages" in state_update:
                for msg in state_update["messages"]:
                    await manager.broadcast({
                        "type": "info",
                        "message": f"Tool executed: {msg.name}"
                    })
                    
        final_state = event

    if final_state is None:
         final_state = await agent_app.ainvoke(initial_state)
    else:
         final_state = list(final_state.values())[0]

    # Return the last message from the agent
    last_message = final_state["messages"][-1]
    await manager.broadcast({"type": "info", "message": "Reasoning cycle complete."})
    return {"response": last_message.content}

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # We don't process user messages via WS directly right now,
            # but we could echo them or acknowledge them.
            await manager.broadcast({"type": "info", "message": f"Client connected and sent query length: {len(data)}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
