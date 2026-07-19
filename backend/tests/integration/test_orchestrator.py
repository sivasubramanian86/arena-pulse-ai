"""Test suite validating backend Orchestrator functionality."""

import pytest

from app.core.agents.edge_swarm import SwarmAnomaly
from app.core.orchestrator import ArenaPulseOrchestrator


async def _no_sleep(_seconds):
    return None

@pytest.mark.asyncio
async def test_orchestrator_cache_hit():
    """Verify that the orchestrator cache hit logic operates correctly."""
    orch = ArenaPulseOrchestrator()
    steps = []
    async for step in orch.execute_task_stream("Where is Gate C?"):
        steps.append(step)

    assert len(steps) == 3
    assert steps[0]["activeTool"] == "Cache Lookup"
    assert steps[1]["activeTool"] == "Cache Retrieval"
    assert steps[2]["status"] == "completed"
    assert "Concourse Zone 1" in steps[2]["thought"]

@pytest.mark.asyncio
async def test_orchestrator_translation_route():
    """Verify that the orchestrator translation route logic operates correctly."""
    orch = ArenaPulseOrchestrator()
    steps = []
    async for step in orch.execute_task_stream("Translate this please: hola"):
        steps.append(step)

    assert len(steps) == 3
    assert steps[1]["agentName"] == "OpsSupervisor"
    assert steps[2]["agentName"] == "PolyglotWorker"
    assert steps[2]["status"] == "completed"

@pytest.mark.asyncio
async def test_orchestrator_complex_flow():
    """Verify that the orchestrator complex flow logic operates correctly."""
    orch = ArenaPulseOrchestrator()
    steps = []
    async for step in orch.execute_task_stream("Topological route from Gate B"):
        steps.append(step)

    assert len(steps) >= 6
    assert steps[0]["agentName"] == "OpsSupervisor"
    assert any(s["agentName"] == "CrowdWorker" for s in steps)
    assert steps[-1]["status"] == "completed"

def test_orchestrator_injected_tools_coverage():
    """Verify that the orchestrator injected tools coverage logic operates correctly."""
    orch = ArenaPulseOrchestrator()
    # Explicitly invoke the tool callbacks bound within _bind_agent_tools
    assert len(orch.crowd_worker.tools) == 2
    assert orch.crowd_worker.tools[0]("n-1")["node_id"] == "n-1"
    assert len(orch.crowd_worker.tools[1]("n-5")) > 0
    assert len(orch.transit_worker.tools) == 1
    assert orch.transit_worker.tools[0]("n-1", "n-4")["source"] == "n-1"
    assert len(orch.logistics_worker.tools) == 1
    assert orch.logistics_worker.tools[0]("n-2")["node_id"] == "n-2"


@pytest.mark.asyncio
async def test_orchestrator_consensus_and_anomaly_branch(monkeypatch):
    """Verify that the orchestrator consensus and anomaly branch logic operates correctly."""
    class FakeSwarmCoordinator:
        def __init__(self, anomaly_threshold):
            self.anomaly_threshold = anomaly_threshold

        async def poll_swarm(self):
            yield SwarmAnomaly(
                device_id="cam-gate-b",
                node_id="n-2",
                anomaly_type="CROWD_SURGE",
                severity=0.91,
                context="Gate B surge",
                multimodal_context={},
            )

    monkeypatch.setattr("app.core.orchestrator.asyncio.sleep", _no_sleep)
    monkeypatch.setattr(
        "app.core.orchestrator.EdgeSwarmCoordinator",
        FakeSwarmCoordinator,
    )

    orch = ArenaPulseOrchestrator()
    steps = []
    async for step in orch.execute_task_stream(
        "Evacuate gate crowd and coordinate transit shuttle"
    ):
        steps.append(step)

    assert any(step["activeTool"] == "Multimodal Ingest" for step in steps)
    assert any(step["activeTool"] == "Consensus Coordinator" for step in steps)
    assert orch.supervisor.memory.long_term[-1]["consensus"] is not None


@pytest.mark.asyncio
async def test_orchestrator_no_anomaly_branch(monkeypatch):
    """Verify that the orchestrator no anomaly branch logic operates correctly."""
    class QuietSwarmCoordinator:
        def __init__(self, anomaly_threshold):
            self.anomaly_threshold = anomaly_threshold

        async def poll_swarm(self):
            if False:
                yield None

    monkeypatch.setattr("app.core.orchestrator.asyncio.sleep", _no_sleep)
    monkeypatch.setattr(
        "app.core.orchestrator.EdgeSwarmCoordinator",
        QuietSwarmCoordinator,
    )

    orch = ArenaPulseOrchestrator()
    steps = []
    async for step in orch.execute_task_stream("Dispatch volunteer logistics staff"):
        steps.append(step)

    assert all(step["activeTool"] != "Multimodal Ingest" for step in steps)
    assert steps[-1]["status"] == "completed"
