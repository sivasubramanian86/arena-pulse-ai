"""Unit tests for ConsensusProtocol — Agent-to-Agent Negotiation."""
import pytest

from app.core.agents.consensus import (
    AgentRecommendation,
    ConsensusProtocol,
    ConsensusResult,
)


def make_rec(
    agent_name: str,
    action: str,
    safety_score: float,
    flow_score: float,
    priority: int = 1,
) -> AgentRecommendation:
    """Create AgentRecommendation objects for testing."""
    return AgentRecommendation(
        agent_name=agent_name,
        action=action,
        rationale=f"{agent_name} recommendation",
        safety_score=safety_score,
        flow_score=flow_score,
        priority=priority,
    )


class TestConsensusProtocol:
    """Tests for ConsensusProtocol negotiation engine."""

    def test_init_default_weights(self) -> None:
        """Verify that the init default weights logic operates correctly."""
        protocol = ConsensusProtocol()
        assert protocol.safety_weight == 0.7
        assert protocol.flow_weight == 0.3
        assert protocol.max_rounds == 3
        assert protocol.convergence_threshold == 0.05

    def test_compute_utility(self) -> None:
        """Verify that the compute utility logic operates correctly."""
        protocol = ConsensusProtocol(safety_weight=0.7, flow_weight=0.3)
        rec = make_rec("CrowdWorker", "CLOSE_GATE_B", safety_score=0.9, flow_score=0.4)
        utility = protocol._compute_utility(rec)
        assert abs(utility - (0.7 * 0.9 + 0.3 * 0.4)) < 0.001

    def test_recommendations_no_conflict(self) -> None:
        """Verify that the recommendations no conflict logic operates correctly."""
        protocol = ConsensusProtocol()
        rec_a = make_rec("CrowdWorker", "HOLD_GATE", safety_score=0.8, flow_score=0.7)
        rec_b = make_rec("TransitWorker", "HOLD_GATE", safety_score=0.82, flow_score=0.68)
        assert not protocol._recommendations_conflict(rec_a, rec_b)

    def test_recommendations_conflict(self) -> None:
        """Verify that the recommendations conflict logic operates correctly."""
        protocol = ConsensusProtocol()
        rec_a = make_rec("CrowdWorker", "CLOSE_GATE_B", safety_score=0.9, flow_score=0.2)
        rec_b = make_rec("TransitWorker", "MAINTAIN_FLOW", safety_score=0.3, flow_score=0.95)
        assert protocol._recommendations_conflict(rec_a, rec_b)

    @pytest.mark.asyncio
    async def test_no_conflict_immediate_agreement(self) -> None:
        """Verify that the no conflict immediate agreement logic operates correctly."""
        protocol = ConsensusProtocol()
        rec_a = make_rec("CrowdWorker", "MAINTAIN_FLOW", safety_score=0.8, flow_score=0.75)
        rec_b = make_rec("TransitWorker", "MAINTAIN_FLOW", safety_score=0.78, flow_score=0.76)

        result = await protocol.negotiate(rec_a, rec_b)

        assert isinstance(result, ConsensusResult)
        assert result.converged is True
        assert result.negotiation_rounds == 0
        assert "CrowdWorker" in result.participating_agents
        assert "TransitWorker" in result.participating_agents

    @pytest.mark.asyncio
    async def test_conflict_resolves_within_max_rounds(self) -> None:
        """Verify that the conflict resolves within max rounds logic operates correctly."""
        protocol = ConsensusProtocol(max_rounds=3, convergence_threshold=0.5)
        # Wide spread — but large threshold forces early convergence
        rec_a = make_rec("CrowdWorker", "CLOSE_GATE_B", safety_score=0.9, flow_score=0.2)
        rec_b = make_rec("TransitWorker", "MAINTAIN_FLOW", safety_score=0.3, flow_score=0.95)

        result = await protocol.negotiate(rec_a, rec_b)

        assert isinstance(result, ConsensusResult)
        assert result.negotiation_rounds >= 1
        assert result.utility_score > 0.0
        assert "CrowdWorker" in result.participating_agents

    @pytest.mark.asyncio
    async def test_conflict_exhausts_rounds_returns_escalation(self) -> None:
        """Verify that the conflict exhausts rounds returns escalation logic operates correctly."""
        # Very tight convergence threshold — forces max_rounds exhaustion
        protocol = ConsensusProtocol(max_rounds=2, convergence_threshold=0.0001)
        rec_a = make_rec("CrowdWorker", "CLOSE_GATE_B", safety_score=0.9, flow_score=0.2)
        rec_b = make_rec("TransitWorker", "MAINTAIN_FLOW", safety_score=0.3, flow_score=0.95)

        result = await protocol.negotiate(rec_a, rec_b)

        assert result.converged is False
        assert result.negotiation_rounds == 2
        assert "escalat" in result.rationale_summary.lower()

    @pytest.mark.asyncio
    async def test_negotiation_hook_is_called(self) -> None:
        """Verify that the negotiation hook is called logic operates correctly."""
        protocol = ConsensusProtocol(max_rounds=3, convergence_threshold=0.0001)
        rec_a = make_rec("CrowdWorker", "CLOSE_GATE_B", safety_score=0.9, flow_score=0.2)
        rec_b = make_rec("TransitWorker", "MAINTAIN_FLOW", safety_score=0.3, flow_score=0.95)

        calls: list = []

        def hook(round_num: int, a: AgentRecommendation, b: AgentRecommendation) -> None:
            calls.append(round_num)

        await protocol.negotiate(rec_a, rec_b, negotiation_hook=hook)

        assert len(calls) >= 1
        assert calls[0] == 1
