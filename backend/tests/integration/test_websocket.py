from app.schemas.websocket_schemas import (
    CrisisAlertPayloadModel,
    NexusEdgeModel,
    NexusNodeModel,
    SafeRouteModel,
    TelemetryPayloadModel,
)


def test_websocket_pydantic_schemas():
    node = NexusNodeModel(id="n-1", name="Gate A", type="GATE", density=0.15, status="optimal")
    assert node.id == "n-1"

    edge = NexusEdgeModel(source="n-1", target="n-4", utilization=0.4)
    telemetry = TelemetryPayloadModel(nexusNodes=[node], nexusEdges=[edge])
    assert len(telemetry.nexusNodes) == 1

    route = SafeRouteModel(path=["n-5", "n-4", "n-1"], estimatedTimeSeconds=45.5, bottleneckNodeId="n-4")
    assert route.estimatedTimeSeconds == 45.5

    alert = CrisisAlertPayloadModel(hazardLevel="extreme", safeRoutes=[route], evacuationProgress=0.45)
    assert alert.hazardLevel == "extreme"
