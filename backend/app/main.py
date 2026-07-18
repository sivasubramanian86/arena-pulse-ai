import asyncio
import os
import json
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.orchestrator import ArenaPulseOrchestrator, topology
from app.schemas.websocket_schemas import (
    NexusNodeModel,
    NexusEdgeModel,
    TelemetryPayloadModel,
    AgentStatePayloadModel,
    AuditLogPayloadModel,
    CrisisAlertPayloadModel,
    SafeRouteModel
)

app = FastAPI(
    title="ArenaPulseAI API",
    description="Multi-agent Smart Stadium Operating System backend",
    version="1.0.0"
)

# Dynamic CORS settings for local development and Cloud deployments
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost:3000",
    "https://genai-apac-2026-491004.web.app",
    "https://genai-apac-2026-491004.firebaseapp.com"
]
if allowed_origins_env:
    origins.extend([o.strip() for o in allowed_origins_env.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = ArenaPulseOrchestrator()

@app.get("/")
async def root():
    """Liveness check endpoint."""
    return {"status": "online", "system": "ArenaPulseAI"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket server for real-time telemetry streaming and agent reasoning execution."""
    await websocket.accept()
    
    # Spawn background task to stream telemetry updates
    async def telemetry_streamer():
        try:
            while True:
                # Randomize density values slightly using the topology's simulated MCP endpoint
                nexus_nodes = []
                for node_id in topology.nodes:
                    node_telemetry = topology.get_live_telemetry_mcp(node_id)
                    nexus_nodes.append(node_telemetry)

                # Create Pydantic payload to guarantee strict validation at serialization time
                payload = TelemetryPayloadModel(
                    nexusNodes=[NexusNodeModel(**n) for n in nexus_nodes],
                    nexusEdges=[NexusEdgeModel(
                        source=e.source,
                        target=e.target,
                        utilization=e.utilization
                    ) for e in topology.edges]
                )

                message = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "event": "telemetry",
                    "payload": payload.model_dump()
                }
                await websocket.send_text(json.dumps(message))
                await asyncio.sleep(3.0)
        except asyncio.CancelledError:
            pass
        except Exception:
            pass

    stream_task = asyncio.create_task(telemetry_streamer())

    try:
        while True:
            # Receive client queries or actions
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            action = payload.get("action")

            if action == "query":
                query_text = payload.get("queryText", "")
                
                # Stream logs and reasoning steps from the orchestrator
                async for step in orchestrator.execute_task_stream(query_text):
                    # Validate agent state payload
                    validated_step = AgentStatePayloadModel(**step)
                    msg = {
                        "timestamp": datetime.utcnow().isoformat(),
                        "event": "agent_state",
                        "payload": validated_step.model_dump()
                    }
                    await websocket.send_text(json.dumps(msg))
                    
                    # Validate audit log payload
                    log_payload = AuditLogPayloadModel(
                        level="info" if step["status"] != "completed" else "success",
                        message=f"{step['agentName']} (Status: {step['status']}): {step['thought']}",
                        component=step["agentName"]
                    )
                    log_msg = {
                        "timestamp": datetime.utcnow().isoformat(),
                        "event": "audit_log",
                        "payload": log_payload.model_dump()
                    }
                    await websocket.send_text(json.dumps(log_msg))
                    await asyncio.sleep(0.05)  # slight spacing for visual rendering pacing

            elif action == "trigger_simulation":
                # Extract hazardLocationId
                params = payload.get("parameters", {})
                hazard_id = params.get("hazardLocationId", "n-5")  # default to Zone 2 (Tribunes)
                
                # Fetch safe routes from graph
                routes = topology.find_safe_evacuation_routes(hazard_id)
                
                # Stream crisis alert
                alert_payload = CrisisAlertPayloadModel(
                    hazardLevel="extreme" if len(routes) > 0 and routes[0]["estimatedTimeSeconds"] > 15 else "high",
                    safeRoutes=[SafeRouteModel(**r) for r in routes],
                    evacuationProgress=0.45
                )
                
                msg = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "event": "crisis_alert",
                    "payload": alert_payload.model_dump()
                }
                await websocket.send_text(json.dumps(msg))

            elif action == "iot_telemetry":
                params = payload.get("parameters", {})
                node_id = params.get("node_id", "n-2")
                delta_density = params.get("delta_density", 0.1)
                reason = params.get("reason", "Local sensor detected footfall congestion")
                mutation = topology.mutate_node(node_id, delta_density, reason)

                mutation_msg = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "event": "graph_mutation",
                    "payload": mutation
                }
                await websocket.send_text(json.dumps(mutation_msg))

    except WebSocketDisconnect:
        pass
    finally:
        stream_task.cancel()
        await stream_task

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
