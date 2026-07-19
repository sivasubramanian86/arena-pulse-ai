import pytest

from app.mcp import MCPServer, MCPServerRegistry, MCPTool


async def _custom_handler() -> dict[str, bool]:
    return {"ok": True}


def test_registry_discovers_tools_by_intent_tags():
    registry = MCPServerRegistry()

    transit_tools = registry.discover("optimize transit metro schedule")
    crowd_tools = registry.discover("crowd density at gate")

    assert {tool.name for tool in transit_tools} == {
        "get_next_departures",
        "get_platform_occupancy",
    }
    assert {tool.name for tool in crowd_tools} >= {"get_node_telemetry"}


def test_registry_lists_and_registers_servers():
    registry = MCPServerRegistry()
    custom_server = MCPServer("CustomOps", "Custom operational tooling")
    custom_tool = MCPTool(
        name="custom_probe",
        description="Probe a custom system",
        input_schema={},
        handler=_custom_handler,
        server_name="CustomOps",
        intent_tags=["custom"],
    )

    custom_server.register_tool(custom_tool)
    registry.register_server(custom_server)

    assert custom_tool in registry.list_all_tools()
    assert registry.discover("custom incident")[0] is custom_tool
    assert registry.discover("unmatched intent") == []


@pytest.mark.asyncio
async def test_simulated_tool_handlers_return_expected_payloads():
    registry = MCPServerRegistry()
    tools = {tool.name: tool for tool in registry.list_all_tools()}

    departures = await tools["get_next_departures"].handler("metlife", "blue")
    occupancy = await tools["get_platform_occupancy"].handler("platform-a")
    node = await tools["get_node_telemetry"].handler("n-1")
    mutation = await tools["mutate_node_weight"].handler("n-1", 0.2, "surge")
    hvac = await tools["set_ventilation_mode"].handler("zone-1", "boost")
    anomalies = await tools["get_scan_anomalies"].handler("gate-a", 123)

    assert departures["frequency_minutes"] == 15
    assert occupancy["status"] == "moderate"
    assert node["status"] == "optimal"
    assert mutation["success"] is True
    assert hvac["mode_set"] == "boost"
    assert anomalies["scan_count"] == 1240
