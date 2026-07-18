from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class NexusNodeModel(BaseModel):
    id: str = Field(description="Unique node identifier")
    name: str = Field(description="Node name")
    type: Literal["ZONE", "GATE", "TRANSIT_STATION", "KIOSK", "WIFI_NODE"]
    density: float = Field(ge=0.0, le=1.0, description="Crowd density ratio")
    status: Literal["optimal", "congested", "critical", "offline"]

class NexusEdgeModel(BaseModel):
    source: str = Field(description="Source node ID")
    target: str = Field(description="Target node ID")
    utilization: float = Field(ge=0.0, le=1.0, description="Edge capacity utilization")

class TelemetryPayloadModel(BaseModel):
    nexusNodes: List[NexusNodeModel]
    nexusEdges: List[NexusEdgeModel]

class AgentStatePayloadModel(BaseModel):
    agentName: Literal[
        "OpsCommanderAgent", "CrowdFlowAgent", "PolyglotAgent", "LogisticsAgent", "TransitAgent",
        "OpsSupervisor", "CrowdWorker", "TransitWorker", "PolyglotWorker", "LogisticsWorker"
    ]
    status: Literal["idle", "thinking", "executing_tool", "completed", "error"]
    thought: str = Field(description="Agent's internal reasoning chain")
    activeTool: Optional[str] = Field(None, description="Active tool if running")
    progress: int = Field(ge=0, le=100)

class AuditLogPayloadModel(BaseModel):
    level: Literal["info", "success", "warning", "error"]
    message: str
    component: str

class SafeRouteModel(BaseModel):
    path: List[str]
    estimatedTimeSeconds: float  # support floats for precision
    bottleneckNodeId: Optional[str] = None

class CrisisAlertPayloadModel(BaseModel):
    hazardLevel: Literal["low", "medium", "high", "extreme"]
    safeRoutes: List[SafeRouteModel]
    evacuationProgress: float = Field(ge=0.0, le=1.0)
