"""Crowd safety and congestion worker agent."""

from app.core.agents.base import ArenaAgent


class CrowdWorker(ArenaAgent):
    """Worker specializing in crowd density, gate flows, and evacuation mapping."""

    def __init__(self) -> None:
        """Initialize the CrowdWorker with specialized instructions and routing settings."""
        super().__init__(
            name="CrowdWorker",
            instruction=(
                "You analyze stadium crowd congestion, calculate gate utilization ratios, "
                "and plan safe evacuation routes. You have access to topological node densities. "
                "Always wrap spatial routes and density recommendations in descriptive XML tags."
            ),
            model="gemini-2.5-pro"  # Complex reasoning tasks route to Pro
        )

    def _mock_fallback(self, prompt: str) -> str:
        return (
            "Analysis: Crowd density at Gate B concourse is critical (85%). "
            "Rerouting evacuation flow to Gate A and Gate C. Safe evacuation path calculated: [n-4 -> n-1 -> n-6]."
        )
