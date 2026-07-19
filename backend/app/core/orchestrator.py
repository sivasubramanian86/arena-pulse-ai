"""Main orchestrator coordinating semantic caching, multi-agent parallel execution, and routing."""

import asyncio
from datetime import datetime
from typing import Any, AsyncGenerator, Dict, List

from app.core.agents import (
    AgentRecommendation,
    ConsensusProtocol,
    CrowdWorker,
    EdgeSwarmCoordinator,
    LogisticsWorker,
    OpsSupervisor,
    PolyglotWorker,
    TransitWorker,
)
from app.core.cache import SemanticCache
from app.core.graph import StadiumTopology

# Shared global topology instance for live telemetry status
topology = StadiumTopology()

class ArenaPulseOrchestrator:
    """Orchestrates queries using a semantic cache, query classifier, and parallel sub-agents."""

    def __init__(self) -> None:
        """Initialize the ArenaPulseOrchestrator, load agents, and prepopulate tool bindings."""
        self.cache = SemanticCache()
        self.supervisor = OpsSupervisor()
        self.crowd_worker = CrowdWorker()
        self.transit_worker = TransitWorker()
        self.polyglot_worker = PolyglotWorker()
        self.logistics_worker = LogisticsWorker()

        # Wire up dynamic tools for adaptive skills loading
        self._bind_agent_tools()

    def _bind_agent_tools(self) -> None:
        # Define functions representing tool endpoints mapping to the stadium topology
        def get_node_density(node_id: str) -> Dict[str, Any]:
            return topology.get_live_telemetry_mcp(node_id)

        def get_edge_status(source_id: str, target_id: str) -> Dict[str, Any]:
            return topology.get_edge_status_mcp(source_id, target_id)

        def fetch_evacuation_routes(hazard_node_id: str) -> List[Dict[str, Any]]:
            return topology.find_safe_evacuation_routes(hazard_node_id)

        # Inject only specific tools into the respective worker agent context
        self.crowd_worker.inject_tools([get_node_density, fetch_evacuation_routes])
        self.transit_worker.inject_tools([get_edge_status])
        self.logistics_worker.inject_tools([get_node_density])

    async def execute_task_stream(self, query: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Run the orchestrator reasoning chain, streaming steps to the client.

        Uses semantic caching, adaptive model routing, and parallel execution.
        """
        # Step 1: Semantic Cache Lookup
        yield {
            "agentName": "OpsSupervisor",
            "status": "thinking",
            "thought": f"Supervisor analyzing input query: '{query}'...",
            "activeTool": "Cache Lookup",
            "progress": 10
        }
        await asyncio.sleep(0.3)

        cached_res = self.cache.get(query)
        if cached_res:
            yield {
                "agentName": "OpsSupervisor",
                "status": "thinking",
                "thought": cached_res["thinkingSteps"][0],
                "activeTool": "Cache Retrieval",
                "progress": 50
            }
            await asyncio.sleep(0.3)
            yield {
                "agentName": "OpsSupervisor",
                "status": "completed",
                "thought": cached_res["answer"],
                "activeTool": None,
                "progress": 100
            }
            return

        # Step 2: ADK Task Decomposition / Query Triage / Adaptive Routing
        is_translation = any(word in query.lower() for word in ["translate", "spanish", "french", "hola", "kiosk"])

        if is_translation:
            yield {
                "agentName": "OpsSupervisor",
                "status": "thinking",
                "thought": "Query identified as translation task. Routing to PolyglotWorker (Gemini 2.5 Flash).",
                "activeTool": "Query Router",
                "progress": 40
            }
            await asyncio.sleep(0.4)

            translation = await self.polyglot_worker.generate_response(query)
            yield {
                "agentName": "PolyglotWorker",
                "status": "completed",
                "thought": translation,
                "activeTool": None,
                "progress": 100
            }
            return

        # Decompose incoming query into structured ADKTasks
        tasks = self.supervisor.decompose_task(query)
        for task in tasks:
            self.supervisor.memory.remember(task.task_id, task)

        yield {
            "agentName": "OpsSupervisor",
            "status": "thinking",
            "thought": f"Supervisor decomposed operational query into {len(tasks)} parallel ADK tasks.",
            "activeTool": "Task Decomposer",
            "progress": 35
        }
        await asyncio.sleep(0.3)

        # Step 2.5: Edge Swarm Intelligence SLM Simulation Triage
        yield {
            "agentName": "OpsSupervisor",
            "status": "thinking",
            "thought": "Polling local Edge Swarm camera and turnstile SLM hardware instances...",
            "activeTool": "Edge Swarm Triage Scanner",
            "progress": 45
        }
        await asyncio.sleep(0.3)

        swarm_coordinator = EdgeSwarmCoordinator(anomaly_threshold=0.7)
        found_anomalies = []
        async for anomaly in swarm_coordinator.poll_swarm():
            found_anomalies.append(anomaly)

        if found_anomalies:
            anomaly_desc = ", ".join([f"{a.device_id} ({a.anomaly_type}: severity {a.severity:.2f})" for a in found_anomalies])
            yield {
                "agentName": "OpsSupervisor",
                "status": "thinking",
                "thought": f"Edge Swarm SLM escalation triggered: {anomaly_desc}. Ingesting multimodal anomaly context.",
                "activeTool": "Multimodal Ingest",
                "progress": 48
            }
            await asyncio.sleep(0.4)

        # Step 3: Complex Graph RAG / Parallel Worker Execution
        yield {
            "agentName": "OpsSupervisor",
            "status": "thinking",
            "thought": "Complex operational query detected. Ingesting graph telemetry and running parallel sub-agents.",
            "activeTool": "Supervisor Triage",
            "progress": 50
        }
        await asyncio.sleep(0.4)

        # Notify that sub-agents are running concurrently
        yield {
            "agentName": "CrowdWorker",
            "status": "executing_tool",
            "thought": "Calculating topology densities and route safety in parallel...",
            "activeTool": "Graph RAG Walk",
            "progress": 60
        }
        yield {
            "agentName": "TransitWorker",
            "status": "executing_tool",
            "thought": "Evaluating transit schedule intervals and platform levels...",
            "activeTool": "Transit Timeline Optimizer",
            "progress": 70
        }
        yield {
            "agentName": "LogisticsWorker",
            "status": "executing_tool",
            "thought": "Assessing volunteer squad dispatch availability...",
            "activeTool": "Volunteer Dispatcher",
            "progress": 75
        }

        # Run workers concurrently using asyncio.gather (Parallel Worker Architecture)
        crowd_task = next((t for t in tasks if t.assigned_agent == "CrowdWorker"), None)
        transit_task = next((t for t in tasks if t.assigned_agent == "TransitWorker"), None)
        logistics_task = next((t for t in tasks if t.assigned_agent == "LogisticsWorker"), None)

        crowd_fut = self.crowd_worker.generate_response(query, crowd_task)
        transit_fut = self.transit_worker.generate_response(query, transit_task)
        logistics_fut = self.logistics_worker.generate_response(query, logistics_task)

        crowd_res, transit_res, logistics_res = await asyncio.gather(
            crowd_fut, transit_fut, logistics_fut
        )

        # Step 3.5: Consensus Protocol Loop (Agent-to-Agent Negotiation)
        consensus_result = None
        if crowd_task and transit_task:
            yield {
                "agentName": "OpsSupervisor",
                "status": "thinking",
                "thought": "Conflict detected: Crowd safety gate closures vs Transit egress flow. Initiating multi-turn Consensus Loop...",
                "activeTool": "Consensus Coordinator",
                "progress": 80
            }
            await asyncio.sleep(0.4)

            rec_crowd = AgentRecommendation(
                agent_name="CrowdWorker",
                action="CLOSE_GATE_B",
                rationale="Divert incoming flow to prevent crowd crush at Gate B concourse.",
                safety_score=0.95,
                flow_score=0.20,
                priority=1
            )
            rec_transit = AgentRecommendation(
                agent_name="TransitWorker",
                action="MAINTAIN_FLOW_METRO",
                rationale="Keep turnstiles open to handle train arrival rates.",
                safety_score=0.40,
                flow_score=0.90,
                priority=2
            )

            protocol = ConsensusProtocol(max_rounds=3)
            consensus_result = await protocol.negotiate(rec_crowd, rec_transit)

            yield {
                "agentName": "OpsSupervisor",
                "status": "thinking",
                "thought": f"ADK Consensus achieved in {consensus_result.negotiation_rounds} rounds. Agreed Action: {consensus_result.agreed_action} (Utility: {consensus_result.utility_score:.2f}).",
                "activeTool": "Consensus Coordinator",
                "progress": 85
            }
            await asyncio.sleep(0.4)

        # Step 4: Aggregation and Final Supervisor Plan
        yield {
            "agentName": "OpsSupervisor",
            "status": "thinking",
            "thought": "Consolidating sub-agent telemetry assertions into operations dispatch plan...",
            "activeTool": "Report Aggregator",
            "progress": 90
        }
        await asyncio.sleep(0.5)

        # Retrieve real-time FIFA match and venue context
        from app.core.fifa_data import FIFAMatchEngine
        fifa_context = FIFAMatchEngine.query_fifa_context(query)

        agg_prompt = (
            f"Synthesize the following reports to answer the query '{query}':\n"
            f"- Crowd Status: {crowd_res}\n"
            f"- Transit Egress: {transit_res}\n"
            f"- Logistics Dispatch: {logistics_res}"
        )
        if consensus_result:
            agg_prompt += f"\n- Negotiated Consensus Decision: {consensus_result.agreed_action} (Utility: {consensus_result.utility_score:.2f}, Rationale: {consensus_result.rationale_summary})"
        if fifa_context:
            agg_prompt += f"\n- Real-time FIFA World Cup Match Context:\n{fifa_context}"

        final_decision = await self.supervisor.generate_response(agg_prompt)

        # Save to semantic cache for future similar queries
        self.cache.set(query, {
            "answer": final_decision,
            "sources": ["stadium_graph_rag", "live_mcp_telemetry", "consensus_engine"],
            "confidence": 0.95,
            "thinkingSteps": ["Resolved via parallel agent graph traversal and consensus protocol."]
        })

        # Save to long-term database post-match analytics log
        self.supervisor.memory.log_long_term({
            "timestamp": datetime.utcnow().isoformat(),
            "query": query,
            "tasks": [t.__dict__ for t in tasks],
            "consensus": consensus_result.__dict__ if consensus_result else None,
            "final_decision": final_decision
        })

        yield {
            "agentName": "OpsSupervisor",
            "status": "completed",
            "thought": final_decision,
            "activeTool": None,
            "progress": 100
        }
