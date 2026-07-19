"""Pydantic schemas for WebSocket telemetry and agent state payloads."""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class NexusNodeModel(BaseModel):
    """Pydantic model representing a single topological node for WebSocket streaming."""

    id: str = Field(description="Unique node identifier")
    name: str = Field(description="Node name")
    type: Literal["ZONE", "GATE", "TRANSIT_STATION", "KIOSK", "WIFI_NODE"]
    density: float = Field(ge=0.0, le=1.0, description="Crowd density ratio")
    status: Literal["optimal", "congested", "critical", "offline"]


class NexusEdgeModel(BaseModel):
    """Pydantic model representing a connection between two topological nodes."""

    source: str = Field(description="Source node ID")
    target: str = Field(description="Target node ID")
    utilization: float = Field(ge=0.0, le=1.0, description="Edge capacity utilization")


class TelemetryPayloadModel(BaseModel):
    """Pydantic model representing the overall stadium telemetry payload."""

    nexusNodes: List[NexusNodeModel]
    nexusEdges: List[NexusEdgeModel]


class AgentStatePayloadModel(BaseModel):
    """Pydantic model representing the active state and progress of an agent."""

    agentName: Literal[
        "OpsCommanderAgent", "CrowdFlowAgent", "PolyglotAgent", "LogisticsAgent", "TransitAgent",
        "OpsSupervisor", "CrowdWorker", "TransitWorker", "PolyglotWorker", "LogisticsWorker"
    ]
    status: Literal["idle", "thinking", "executing_tool", "completed", "error"]
    thought: str = Field(description="Agent's internal reasoning chain")
    activeTool: Optional[str] = Field(None, description="Active tool if running")
    progress: int = Field(ge=0, le=100)


class AuditLogPayloadModel(BaseModel):
    """Pydantic model representing a single audit log entry streamed via WebSocket."""

    level: Literal["info", "success", "warning", "error"]
    message: str
    component: str


class SafeRouteModel(BaseModel):
    """Pydantic model representing a computed safe evacuation path."""

    path: List[str]
    estimatedTimeSeconds: float  # support floats for precision
    bottleneckNodeId: Optional[str] = None


class CrisisAlertPayloadModel(BaseModel):
    """Pydantic model representing a crisis status payload with safe routes."""

    hazardLevel: Literal["low", "medium", "high", "extreme"]
    safeRoutes: List[SafeRouteModel]
    evacuationProgress: float = Field(ge=0.0, le=1.0)
