"""MCP Standardized Tool Binding for ArenaPulseAI.

All external integrations are strictly defined as MCP Server entries.
ADK agents discover and bind tools at runtime based on crisis context,
ensuring zero hardcoded API calls in agent logic.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Dict, List


@dataclass
class MCPTool:
    """Represents a single tool exposed by an MCP Server."""

    name: str
    description: str
    input_schema: Dict[str, Any]
    handler: Callable[..., Awaitable[Dict[str, Any]]]
    server_name: str
    intent_tags: List[str]  # used for dynamic intent-based discovery


@dataclass
class MCPServer:
    """Represents an external integration registered as an MCP Server."""

    name: str
    description: str
    tools: List[MCPTool] = field(default_factory=list)

    def register_tool(self, tool: MCPTool) -> None:
        """Register a tool with this server."""
        self.tools.append(tool)


class MCPServerRegistry:
    """Dynamic MCP tool discovery and binding registry.

    Agents call `discover(intent_context)` at runtime to get only the
    tools relevant to their current task context. This implements the
    ADK principle of adaptive tool injection — agents never load the
    full tool catalog into their context window.
    """

    def __init__(self) -> None:
        """Initialize the MCPServerRegistry and bootstrap servers."""
        self._servers: Dict[str, MCPServer] = {}
        self._initialize_servers()

    def _initialize_servers(self) -> None:
        """Bootstrap all MCP server definitions and their tool handlers."""
        # ── Metro Transit MCP Server ─────────────────────────────────────────
        metro_server = MCPServer(
            name="MetroAPI",
            description="City Metro rail schedule, platform status, and transit frequency APIs",
        )
        metro_server.register_tool(MCPTool(
            name="get_next_departures",
            description="Fetch next 5 metro departures from MetLife Hub",
            input_schema={"station_id": "string", "line": "string"},
            handler=self._metro_get_departures,
            server_name="MetroAPI",
            intent_tags=["transit", "schedule", "shuttle", "metro"],
        ))
        metro_server.register_tool(MCPTool(
            name="get_platform_occupancy",
            description="Fetch current platform crowd occupancy percentage",
            input_schema={"platform_id": "string"},
            handler=self._metro_get_platform_occupancy,
            server_name="MetroAPI",
            intent_tags=["transit", "platform", "occupancy"],
        ))

        # ── Stadium Graph MCP Server ─────────────────────────────────────────
        graph_server = MCPServer(
            name="StadiumGraph",
            description="Live stadium topology graph mutations and telemetry reads",
        )
        graph_server.register_tool(MCPTool(
            name="get_node_telemetry",
            description="Fetch live crowd density and status for a stadium node",
            input_schema={"node_id": "string"},
            handler=self._graph_get_node,
            server_name="StadiumGraph",
            intent_tags=["crowd", "gate", "zone", "density", "congestion"],
        ))
        graph_server.register_tool(MCPTool(
            name="mutate_node_weight",
            description="Update node friction weight from IoT telemetry event",
            input_schema={"node_id": "string", "delta_density": "float", "reason": "string"},
            handler=self._graph_mutate_node,
            server_name="StadiumGraph",
            intent_tags=["iot", "telemetry", "mutation", "graph"],
        ))

        # ── HVAC MCP Server ──────────────────────────────────────────────────
        hvac_server = MCPServer(
            name="HVACControl",
            description="Stadium HVAC zone control and air quality monitoring",
        )
        hvac_server.register_tool(MCPTool(
            name="set_ventilation_mode",
            description="Adjust stadium ventilation for crowd density surge mitigation",
            input_schema={"zone_id": "string", "mode": "string"},
            handler=self._hvac_set_mode,
            server_name="HVACControl",
            intent_tags=["hvac", "ventilation", "air", "zone"],
        ))

        # ── Biometric Scanner MCP Server ─────────────────────────────────────
        biometric_server = MCPServer(
            name="BiometricScanner",
            description="Gate biometric scan rate and anomaly detection APIs",
        )
        biometric_server.register_tool(MCPTool(
            name="get_scan_anomalies",
            description="Retrieve biometric scan anomalies at a specified gate",
            input_schema={"gate_id": "string", "since_epoch": "int"},
            handler=self._biometric_get_anomalies,
            server_name="BiometricScanner",
            intent_tags=["security", "biometric", "gate", "scan", "anomaly"],
        ))

        self._servers = {
            s.name: s for s in [metro_server, graph_server, hvac_server, biometric_server]
        }

    def register_server(self, server: MCPServer) -> None:
        """Register a new MCP server at runtime."""
        self._servers[server.name] = server

    def discover(self, intent_context: str) -> List[MCPTool]:
        """Discover and return only the tools relevant to the given intent context.

        Performs keyword matching against tool intent_tags.
        This ensures agents load minimal context into their window.
        """
        tokens = set(intent_context.lower().split())
        matched: List[MCPTool] = []

        for server in self._servers.values():
            for tool in server.tools:
                if tokens & set(tool.intent_tags):
                    matched.append(tool)

        return matched

    def list_all_tools(self) -> List[MCPTool]:
        """List all registered tools across all MCP servers."""
        return [t for s in self._servers.values() for t in s.tools]

    # ── Simulated Tool Handlers ───────────────────────────────────────────────

    async def _metro_get_departures(self, station_id: str, line: str) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        return {
            "station_id": station_id,
            "line": line,
            "next_departures": ["18:42", "18:57", "19:12", "19:27", "19:42"],
            "frequency_minutes": 15,
        }

    async def _metro_get_platform_occupancy(self, platform_id: str) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        return {"platform_id": platform_id, "occupancy_pct": 62.5, "status": "moderate"}

    async def _graph_get_node(self, node_id: str) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        return {"node_id": node_id, "density": 0.55, "status": "optimal"}

    async def _graph_mutate_node(self, node_id: str, delta_density: float, reason: str) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        return {"node_id": node_id, "delta_applied": delta_density, "reason": reason, "success": True}

    async def _hvac_set_mode(self, zone_id: str, mode: str) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        return {"zone_id": zone_id, "mode_set": mode, "success": True}

    async def _biometric_get_anomalies(self, gate_id: str, since_epoch: int) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        return {"gate_id": gate_id, "anomalies": [], "scan_count": 1240, "error_rate": 0.002}
