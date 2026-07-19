"""OpsSupervisor orchestrating and aggregation agent."""

from typing import List

from app.core.agents.base import ADKTask, ArenaAgent


class OpsSupervisor(ArenaAgent):
    """Supervisor agent that triages incoming queries, routes to workers, and aggregates responses."""

    def __init__(self) -> None:
        """Initialize the OpsSupervisor agent with director instructions and models."""
        super().__init__(
            name="OpsSupervisor",
            instruction=(
                "You are the master Stadium Operations Director. Triage incoming queries and route "
                "them to the relevant sub-agents (Crowd, Transit, Polyglot, Logistics) for parallel execution. "
                "Aggregate their responses to output a unified decision."
            ),
            model="gemini-2.5-pro"
        )

    def decompose_task(self, query: str) -> List[ADKTask]:
        """ADK task decomposition: parses query to emit structured ADKTask objects."""
        tasks = []
        q_lower = query.lower()
        if any(w in q_lower for w in ["gate", "crowd", "evacuate", "safety", "hazard"]):
            tasks.append(ADKTask(task_id="task-crowd-triage", intent="crowd_density_check", priority=1, assigned_agent="CrowdWorker"))
        if any(w in q_lower for w in ["transit", "metro", "bus", "train", "outbound", "shuttle"]):
            tasks.append(ADKTask(task_id="task-transit-optimize", intent="transit_timeline_optimization", priority=2, assigned_agent="TransitWorker"))
        if any(w in q_lower for w in ["volunteer", "staff", "squad", "dispatch", "logistics"]):
            tasks.append(ADKTask(task_id="task-volunteer-dispatch", intent="logistics_volunteer_dispatch", priority=2, assigned_agent="LogisticsWorker"))

        # Default task fallback
        if not tasks:
            tasks.append(ADKTask(task_id="task-gen-ops", intent="general_operations_query", priority=3, assigned_agent="CrowdWorker"))
        return tasks

    def _mock_fallback(self, prompt: str) -> str:
        return (
            "Supervisor Dispatch Plan: Bottleneck resolved. Crowd flow diverted from Gate B to Gate A/C. "
            "Express shuttles coordinated. Volunteers positioned on-site."
        )
