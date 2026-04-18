from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
import json

app = FastAPI(title="KubeAssist API", description="AI Ops Assistant for Kubernetes")

class QueryRequest(BaseModel):
    query: str
    namespace: str = "default"

@app.get("/")
async def root():
    return {"message": "Welcome to KubeAssist API"}

@app.post("/api/query")
async def process_query(request: QueryRequest):
    # This will later be connected to our LangGraph agent
    return {"response": f"Received query: '{request.query}' in namespace '{request.namespace}'"}

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now; later we will stream agent's 'Thought Stream'
            await websocket.send_text(json.dumps({"type": "info", "message": f"Client said: {data}"}))
    except WebSocketDisconnect:
        print("Client disconnected")
