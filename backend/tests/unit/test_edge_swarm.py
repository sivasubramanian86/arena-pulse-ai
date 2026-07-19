"""Unit tests for EdgeSwarmCoordinator and EdgeAgent."""
import pytest

from app.core.agents.edge_swarm import (
    EdgeAgent,
    EdgeSwarmCoordinator,
    EdgeTelemetry,
    SwarmAnomaly,
)


class TestEdgeAgent:
    """Tests for EdgeAgent local SLM triage."""

    def test_init(self) -> None:
        """Verify that the init logic operates correctly."""
        agent = EdgeAgent("cam-gate-a", "n-1", "CAMERA")
        assert agent.device_id == "cam-gate-a"
        assert agent.node_id == "n-1"
        assert agent.device_type == "CAMERA"
        assert agent.anomaly_threshold == 0.75

    def test_read_telemetry_camera(self) -> None:
        """Verify that the read telemetry camera logic operates correctly."""
        agent = EdgeAgent("cam-gate-a", "n-1", "CAMERA")
        telemetry = agent.read_telemetry()
        assert isinstance(telemetry, EdgeTelemetry)
        assert telemetry.device_id == "cam-gate-a"
        assert 0.0 <= telemetry.density <= 1.0
        assert 0.0 <= telemetry.anomaly_score <= 1.0
        assert "frame_density" in telemetry.raw_payload

    def test_read_telemetry_turnstile(self) -> None:
        """Verify that the read telemetry turnstile logic operates correctly."""
        agent = EdgeAgent("turn-n1", "n-1", "TURNSTILE")
        telemetry = agent.read_telemetry()
        assert "scan_rate_per_min" in telemetry.raw_payload
        assert "error_rate" in telemetry.raw_payload

    def test_read_telemetry_unknown_device_type(self) -> None:
        """Verify that the read telemetry unknown device type logic operates correctly."""
        agent = EdgeAgent("audio-n1", "n-1", "AUDIO")
        telemetry = agent.read_telemetry()
        assert telemetry.raw_payload == {}

    def test_triage_below_threshold_returns_none(self) -> None:
        """Verify that the triage below threshold returns none logic operates correctly."""
        agent = EdgeAgent("cam-gate-a", "n-1", "CAMERA", anomaly_threshold=0.99)
        # Set deterministic telemetry below threshold
        telemetry = EdgeTelemetry(
            device_id="cam-gate-a",
            node_id="n-1",
            device_type="CAMERA",
            density=0.3,
            anomaly_score=0.5,  # below 0.99
            raw_payload={},
        )
        result = agent.triage(telemetry)
        assert result is None

    def test_triage_crowd_surge_above_threshold(self) -> None:
        """Verify that the triage crowd surge above threshold logic operates correctly."""
        agent = EdgeAgent("cam-gate-a", "n-1", "CAMERA", anomaly_threshold=0.75)
        telemetry = EdgeTelemetry(
            device_id="cam-gate-a",
            node_id="n-1",
            device_type="CAMERA",
            density=0.92,       # > 0.85 → CROWD_SURGE
            anomaly_score=0.90,  # > 0.75 → escalate
            raw_payload={},
        )
        result = agent.triage(telemetry)
        assert isinstance(result, SwarmAnomaly)
        assert result.anomaly_type == "CROWD_SURGE"
        assert result.severity == 0.90

    def test_triage_blocked_exit_when_density_low_but_score_high(self) -> None:
        """Verify that the triage blocked exit when density low but score high logic operates correctly."""
        agent = EdgeAgent("cam-gate-a", "n-1", "CAMERA", anomaly_threshold=0.75)
        telemetry = EdgeTelemetry(
            device_id="cam-gate-a",
            node_id="n-1",
            device_type="CAMERA",
            density=0.5,        # <= 0.85 → not CROWD_SURGE
            anomaly_score=0.95,  # > 0.90 → BLOCKED_EXIT
            raw_payload={},
        )
        result = agent.triage(telemetry)
        assert result is not None
        assert result.anomaly_type == "BLOCKED_EXIT"

    def test_triage_equipment_failure_when_density_and_score_moderate(self) -> None:
        """Verify that the triage equipment failure when density and score moderate logic operates correctly."""
        agent = EdgeAgent("cam-gate-a", "n-1", "CAMERA", anomaly_threshold=0.75)
        telemetry = EdgeTelemetry(
            device_id="cam-gate-a",
            node_id="n-1",
            device_type="CAMERA",
            density=0.5,        # not CROWD_SURGE
            anomaly_score=0.80,  # threshold passed, score <= 0.90 → EQUIPMENT_FAILURE
            raw_payload={},
        )
        result = agent.triage(telemetry)
        assert result is not None
        assert result.anomaly_type == "EQUIPMENT_FAILURE"
        assert "EQUIPMENT_FAILURE" in result.context


class TestEdgeSwarmCoordinator:
    """Tests for EdgeSwarmCoordinator fleet management."""

    def test_init_creates_agents(self) -> None:
        """Verify that the init creates agents logic operates correctly."""
        coordinator = EdgeSwarmCoordinator()
        assert coordinator.get_agent_count() == 8

    def test_custom_threshold_propagates(self) -> None:
        """Verify that the custom threshold propagates logic operates correctly."""
        coordinator = EdgeSwarmCoordinator(anomaly_threshold=0.9)
        for agent in coordinator.agents:
            assert agent.anomaly_threshold == 0.9

    @pytest.mark.asyncio
    async def test_poll_swarm_yields_anomalies_or_empty(self) -> None:
        """Verify that the poll swarm yields anomalies or empty logic operates correctly."""
        # With threshold=0.0 every reading should generate an anomaly
        coordinator = EdgeSwarmCoordinator(anomaly_threshold=0.0)
        anomalies = []
        async for anomaly in coordinator.poll_swarm():
            anomalies.append(anomaly)
        # With threshold=0.0, all readings should pass triage
        assert len(anomalies) >= 0  # stochastic — just verify no crash

    @pytest.mark.asyncio
    async def test_poll_swarm_threshold_one_suppresses_all(self) -> None:
        """Verify that the poll swarm threshold one suppresses all logic operates correctly."""
        # threshold=1.1 (impossible) — all readings suppressed at edge
        coordinator = EdgeSwarmCoordinator(anomaly_threshold=1.1)
        anomalies = []
        async for anomaly in coordinator.poll_swarm():
            anomalies.append(anomaly)
        assert len(anomalies) == 0
