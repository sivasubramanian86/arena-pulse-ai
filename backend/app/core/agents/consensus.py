"""
Consensus Protocol for ArenaPulseAI Agent-to-Agent Negotiation.

Implements multi-turn autonomous negotiation between conflicting worker agents
to maximize a shared utility function before escalating to OpsSupervisor.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional


@dataclass
class AgentRecommendation:
    """Structured recommendation from a single worker agent."""
    agent_name: str
    action: str          # e.g. "CLOSE_GATE_B", "MAINTAIN_FLOW"
    rationale: str
    safety_score: float  # 0.0 → 1.0 (higher = safer)
    flow_score: float    # 0.0 → 1.0 (higher = better fan throughput)
    priority: int        # 1 = urgent, 3 = low


@dataclass
class ConsensusResult:
    """Final negotiated result after multi-turn agent consensus."""
    agreed_action: str
    utility_score: float          # composite score after negotiation
    negotiation_rounds: int
    participating_agents: List[str]
    rationale_summary: str
    converged: bool               # True if agreement reached, False if escalated


class ConsensusProtocol:
    """
    Implements an ADK-style Agent-to-Agent Consensus Loop.

    When CrowdWorker and TransitWorker have conflicting objectives, this protocol
    runs up to `max_rounds` negotiation turns to maximize the shared utility:

        utility = (safety_weight * safety_score) + (flow_weight * flow_score)

    If consensus is not reached within max_rounds, the best compromise is
    selected and flagged for human escalation.
    """

    def __init__(
        self,
        safety_weight: float = 0.7,
        flow_weight: float = 0.3,
        max_rounds: int = 3,
        convergence_threshold: float = 0.05,
    ) -> None:
        self.safety_weight = safety_weight
        self.flow_weight = flow_weight
        self.max_rounds = max_rounds
        self.convergence_threshold = convergence_threshold

    def _compute_utility(self, rec: AgentRecommendation) -> float:
        return (self.safety_weight * rec.safety_score) + (self.flow_weight * rec.flow_score)

    def _recommendations_conflict(
        self,
        rec_a: AgentRecommendation,
        rec_b: AgentRecommendation,
    ) -> bool:
        """Returns True if agents recommend contradictory actions."""
        safety_delta = abs(rec_a.safety_score - rec_b.safety_score)
        flow_delta = abs(rec_a.flow_score - rec_b.flow_score)
        return safety_delta > 0.2 or flow_delta > 0.2

    async def negotiate(
        self,
        rec_a: AgentRecommendation,
        rec_b: AgentRecommendation,
        negotiation_hook: Optional[Callable[[int, AgentRecommendation, AgentRecommendation], None]] = None,
    ) -> ConsensusResult:
        """
        Run multi-turn negotiation between two agent recommendations.

        Each round, both agents slightly converge towards the composite utility
        optimum via gradient-style score adjustment. A negotiation_hook callback
        is invoked each round for observability (e.g., streaming to the UI).
        """
        if not self._recommendations_conflict(rec_a, rec_b):
            # No conflict — immediate agreement on highest utility recommendation
            winner = rec_a if self._compute_utility(rec_a) >= self._compute_utility(rec_b) else rec_b
            return ConsensusResult(
                agreed_action=winner.action,
                utility_score=self._compute_utility(winner),
                negotiation_rounds=0,
                participating_agents=[rec_a.agent_name, rec_b.agent_name],
                rationale_summary=f"No conflict detected. Adopted {winner.agent_name} recommendation: {winner.rationale}",
                converged=True,
            )

        current_a = AgentRecommendation(**rec_a.__dict__)
        current_b = AgentRecommendation(**rec_b.__dict__)
        rounds_taken = 0

        for round_num in range(1, self.max_rounds + 1):
            rounds_taken = round_num
            utility_a = self._compute_utility(current_a)
            utility_b = self._compute_utility(current_b)

            if negotiation_hook:
                negotiation_hook(round_num, current_a, current_b)

            await asyncio.sleep(0.1)  # Simulate async negotiation turn

            # Convergence check: both utilities within threshold
            if abs(utility_a - utility_b) <= self.convergence_threshold:
                best = current_a if utility_a >= utility_b else current_b
                return ConsensusResult(
                    agreed_action=best.action,
                    utility_score=max(utility_a, utility_b),
                    negotiation_rounds=rounds_taken,
                    participating_agents=[rec_a.agent_name, rec_b.agent_name],
                    rationale_summary=(
                        f"Consensus reached in round {round_num}. "
                        f"Adopted {best.agent_name} proposal. "
                        f"Safety: {best.safety_score:.2f}, Flow: {best.flow_score:.2f}."
                    ),
                    converged=True,
                )

            # Negotiation: each agent adjusts scores towards composite optimum
            composite_safety = (current_a.safety_score + current_b.safety_score) / 2.0
            composite_flow = (current_a.flow_score + current_b.flow_score) / 2.0

            # Agents nudge towards composite (weighted by their priority)
            adjustment = 0.15
            current_a.safety_score += adjustment * (composite_safety - current_a.safety_score)
            current_a.flow_score += adjustment * (composite_flow - current_a.flow_score)
            current_b.safety_score += adjustment * (composite_safety - current_b.safety_score)
            current_b.flow_score += adjustment * (composite_flow - current_b.flow_score)

        # max_rounds exceeded — select best remaining proposal
        utility_a = self._compute_utility(current_a)
        utility_b = self._compute_utility(current_b)
        best = current_a if utility_a >= utility_b else current_b

        return ConsensusResult(
            agreed_action=best.action,
            utility_score=max(utility_a, utility_b),
            negotiation_rounds=rounds_taken,
            participating_agents=[rec_a.agent_name, rec_b.agent_name],
            rationale_summary=(
                f"Max negotiation rounds ({self.max_rounds}) exhausted. "
                f"Escalating {best.agent_name} proposal to OpsSupervisor for HITL review. "
                f"Safety: {best.safety_score:.2f}, Flow: {best.flow_score:.2f}."
            ),
            converged=False,
        )
