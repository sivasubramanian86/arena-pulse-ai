from app.core.agents.base import ArenaAgent

class LogisticsWorker(ArenaAgent):
    """Worker specializing in volunteer dispatches, equipment checks, and physical security assets."""

    def __init__(self) -> None:
        super().__init__(
            name="LogisticsWorker",
            instruction=(
                "You coordinate volunteer placements, dispatch security assets to congested concourses, "
                "and ensure gates are clear for evacuation."
            ),
            model="gemini-2.5-pro"
        )

    def _mock_fallback(self, prompt: str) -> str:
        return "Dispatched 5 volunteer squads and 2 safety supervisors from Central Reserve to Gate B to assist with crowd flow redirection."
