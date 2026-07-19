from app.core.agents.base import ArenaAgent


class TransitWorker(ArenaAgent):
    """Worker specializing in public transport synchronization and shuttle timelines."""

    def __init__(self) -> None:
        super().__init__(
            name="TransitWorker",
            instruction=(
                "You synchronize train, bus, and express shuttle departures with live stadium egress. "
                "Adjust frequency intervals based on gate traffic flow."
            ),
            model="gemini-2.5-pro"  # Complex scheduling tasks route to Pro
        )

    def _mock_fallback(self, prompt: str) -> str:
        return (
            "Egress Event: Adjusting Express Shuttle 1 departures to 5-minute intervals. "
            "Alerting Transit Hub Alpha to clear platform queues."
        )
