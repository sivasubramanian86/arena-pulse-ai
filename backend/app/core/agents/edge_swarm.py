"""Edge Swarm Intelligence for ArenaPulseAI.

Simulates quantized Small Language Models (SLMs) running locally on stadium
hardware (cameras, turnstiles). Edge Agents perform immediate local triage
and only stream anomalies to the central Gemini orchestrator when a
configurable threshold is breached.
"""

from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass
from typing import Any, AsyncGenerator, Dict, List, Optional


@dataclass
class EdgeTelemetry:
    """Real-time sensor reading from a single edge device."""

    device_id: str
    node_id: str          # maps to StadiumNode id
    device_type: str      # CAMERA | TURNSTILE | HVAC | AUDIO
    density: float        # local crowd density reading
    anomaly_score: float  # 0.0 = nominal, 1.0 = critical
    raw_payload: Dict[str, Any]     # simulated multimodal payload


@dataclass
class SwarmAnomaly:
    """Anomaly report streamed from edge swarm to central orchestrator."""

    device_id: str
    node_id: str
    anomaly_type: str     # CROWD_SURGE | BLOCKED_EXIT | EQUIPMENT_FAILURE
    severity: float       # 0.0 → 1.0
    context: str          # human-readable triage summary
    multimodal_context: Dict[str, Any]  # structured JSON for Gemini multimodal context


class EdgeAgent:
    """Simulates a quantized SLM running on stadium edge hardware.

    Performs immediate local triage of IoT telemetry. Only escalates
    to the central orchestrator when anomaly_score breaches the threshold,
    minimizing bandwidth and central inference load.
    """

    def __init__(
        self,
        device_id: str,
        node_id: str,
        device_type: str,
        anomaly_threshold: float = 0.75,
    ) -> None:
        """Initialize the EdgeAgent with ID, target node, and anomaly thresholds."""
        self.device_id = device_id
        self.node_id = node_id
        self.device_type = device_type
        self.anomaly_threshold = anomaly_threshold

    def read_telemetry(self) -> EdgeTelemetry:
        """Simulate sensor reading with stochastic variance."""
        base_density = random.uniform(0.0, 1.0)
        anomaly_score = random.uniform(0.0, 1.0)

        payload: Dict[str, Any] = {}
        if self.device_type == "CAMERA":
            payload = {
                "frame_density": round(base_density, 3),
                "motion_vectors": "uniform" if base_density < 0.6 else "chaotic",
                "audio_transcript": None,
            }
        elif self.device_type == "TURNSTILE":
            payload = {
                "scan_rate_per_min": int(base_density * 120),
                "error_rate": round(anomaly_score * 0.15, 3),
            }

        return EdgeTelemetry(
            device_id=self.device_id,
            node_id=self.node_id,
            device_type=self.device_type,
            density=round(base_density, 3),
            anomaly_score=round(anomaly_score, 3),
            raw_payload=payload,
        )

    def triage(self, telemetry: EdgeTelemetry) -> Optional[SwarmAnomaly]:
        """Local SLM triage.

        Returns a SwarmAnomaly if threshold is breached, else returns None
        (anomaly suppressed at edge — no uplink required).
        """
        if telemetry.anomaly_score < self.anomaly_threshold:
            return None

        if telemetry.density > 0.85:
            anomaly_type = "CROWD_SURGE"
        elif telemetry.anomaly_score > 0.90:
            anomaly_type = "BLOCKED_EXIT"
        else:
            anomaly_type = "EQUIPMENT_FAILURE"

        return SwarmAnomaly(
            device_id=self.device_id,
            node_id=self.node_id,
            anomaly_type=anomaly_type,
            severity=telemetry.anomaly_score,
            context=(
                f"{self.device_type} at node {self.node_id} reports anomaly. "
                f"Density: {telemetry.density:.1%}, Score: {telemetry.anomaly_score:.2f}. "
                f"Type: {anomaly_type}."
            ),
            multimodal_context={
                "device_type": self.device_type,
                "node_id": self.node_id,
                "density": telemetry.density,
                "anomaly_score": telemetry.anomaly_score,
                "raw_payload": telemetry.raw_payload,
            },
        )


class EdgeSwarmCoordinator:
    """Manages a swarm of EdgeAgents across all stadium hardware nodes.

    Polls all edge agents concurrently using asyncio, collects anomalies
    that breach threshold, and yields them for central Gemini orchestration.
    Only nodes with breaching anomalies generate uplink traffic.
    """

    def __init__(self, anomaly_threshold: float = 0.75) -> None:
        """Initialize the coordinator with an anomaly threshold and bootstrap the agents."""
        self.agents: List[EdgeAgent] = []
        self._initialize_swarm(anomaly_threshold)

    def _initialize_swarm(self, threshold: float) -> None:
        """Bootstrap edge agents representing stadium hardware devices."""
        devices = [
            ("cam-gate-a", "n-1", "CAMERA"),
            ("cam-gate-b", "n-2", "CAMERA"),
            ("cam-gate-c", "n-3", "CAMERA"),
            ("turn-n1", "n-1", "TURNSTILE"),
            ("turn-n2", "n-2", "TURNSTILE"),
            ("cam-zone1", "n-4", "CAMERA"),
            ("cam-zone2", "n-5", "CAMERA"),
            ("turn-transit", "n-6", "TURNSTILE"),
        ]
        self.agents = [
            EdgeAgent(device_id, node_id, device_type, threshold)
            for device_id, node_id, device_type in devices
        ]

    async def poll_swarm(self) -> AsyncGenerator[SwarmAnomaly, None]:
        """Concurrently poll all edge agents and yield anomalies that breach threshold.

        Nominal readings are suppressed at the edge (no central uplink).
        """
        loop = asyncio.get_event_loop()

        def _poll_agent(agent: EdgeAgent) -> Optional[SwarmAnomaly]:
            telemetry = agent.read_telemetry()
            return agent.triage(telemetry)

        # Run all agent polls concurrently in thread pool
        tasks = [
            loop.run_in_executor(None, _poll_agent, agent)
            for agent in self.agents
        ]
        results = await asyncio.gather(*tasks)

        for anomaly in results:
            if anomaly is not None:
                yield anomaly

    def get_agent_count(self) -> int:
        """Return the total count of edge agents registered in the swarm."""
        return len(self.agents)
