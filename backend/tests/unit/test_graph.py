"""Test suite validating backend Graph functionality."""

from app.core.graph import StadiumEdge, StadiumTopology


def test_topology_initialization():
    """Verify that the topology initialization logic operates correctly."""
    topo = StadiumTopology()
    assert len(topo.nodes) == 7
    assert len(topo.edges) == 12
    assert "n-1" in topo.nodes
    assert topo.nodes["n-1"].name == "Gate A"

def test_mcp_node_telemetry_valid():
    """Verify that the mcp node telemetry valid logic operates correctly."""
    topo = StadiumTopology()
    telemetry = topo.get_live_telemetry_mcp("n-1")
    assert telemetry["node_id"] == "n-1"
    assert "density" in telemetry
    assert telemetry["status"] in ["optimal", "congested", "critical"]

def test_mcp_node_telemetry_congested(monkeypatch):
    """Verify that the mcp node telemetry congested logic operates correctly."""
    topo = StadiumTopology()
    topo.nodes["n-1"].density = 0.70
    monkeypatch.setattr("random.uniform", lambda a, b: 0.0)
    telemetry = topo.get_live_telemetry_mcp("n-1")
    assert telemetry["status"] == "congested"

def test_mcp_node_telemetry_critical(monkeypatch):
    """Verify that the mcp node telemetry critical logic operates correctly."""
    topo = StadiumTopology()
    topo.nodes["n-1"].density = 0.90
    monkeypatch.setattr("random.uniform", lambda a, b: 0.0)
    telemetry = topo.get_live_telemetry_mcp("n-1")
    assert telemetry["status"] == "critical"

def test_mcp_node_telemetry_invalid():
    """Verify that the mcp node telemetry invalid logic operates correctly."""
    topo = StadiumTopology()
    telemetry = topo.get_live_telemetry_mcp("n-invalid")
    assert "error" in telemetry

def test_mcp_edge_status_valid():
    """Verify that the mcp edge status valid logic operates correctly."""
    topo = StadiumTopology()
    status = topo.get_edge_status_mcp("n-1", "n-4")
    assert status["source"] == "n-1"
    assert status["target"] == "n-4"
    assert "utilization" in status

def test_mcp_edge_status_invalid_source():
    """Verify that the mcp edge status invalid source logic operates correctly."""
    topo = StadiumTopology()
    status = topo.get_edge_status_mcp("n-invalid", "n-4")
    assert "error" in status
    status_unconnected = topo.get_edge_status_mcp("n-1", "n-2")
    assert "error" in status_unconnected

def test_mcp_edge_status_invalid_target():
    """Verify that the mcp edge status invalid target logic operates correctly."""
    topo = StadiumTopology()
    status = topo.get_edge_status_mcp("n-1", "n-invalid")
    assert "error" in status

def test_find_safe_evacuation_routes_and_bottlenecks():
    """Verify that the find safe evacuation routes and bottlenecks logic operates correctly."""
    topo = StadiumTopology()
    topo.nodes["n-4"].density = 0.75
    routes = topo.find_safe_evacuation_routes("n-5")
    assert len(routes) > 0
    assert any(r["bottleneckNodeId"] == "n-4" for r in routes)

def test_find_safe_evacuation_routes_unreachable():
    """Verify that the find safe evacuation routes unreachable logic operates correctly."""
    topo = StadiumTopology()
    topo.edges = [e for e in topo.edges if e.source != "n-7" and e.target != "n-7"]
    routes = topo.find_safe_evacuation_routes("n-7")
    assert len(routes) == 0

def test_dijkstra_routing_weights():
    """Verify that the dijkstra routing weights logic operates correctly."""
    topo = StadiumTopology()
    topo.nodes["n-4"].status = "critical"
    topo.nodes["n-1"].status = "congested"
    routes = topo.find_safe_evacuation_routes("n-5")
    assert len(routes) > 0

def test_dijkstra_invalid_nodes():
    """Verify that the dijkstra invalid nodes logic operates correctly."""
    topo = StadiumTopology()
    assert topo._dijkstra("n-invalid", "n-1") is None
    assert topo._dijkstra("n-1", "n-invalid") is None

def test_dijkstra_longer_path_branch():
    """Verify that the dijkstra longer path branch logic operates correctly."""
    topo = StadiumTopology()
    topo.edges.append(StadiumEdge(source="n-1", target="n-3", weight=1.0, capacity=100.0, utilization=0.0))
    topo.edges.append(StadiumEdge(source="n-1", target="n-2", weight=5.0, capacity=100.0, utilization=0.0))
    topo.edges.append(StadiumEdge(source="n-2", target="n-3", weight=5.0, capacity=100.0, utilization=0.0))
    path = topo._dijkstra("n-1", "n-2")
    assert path == ["n-1", "n-2"]

def test_dijkstra_unreachable_node():
    """Verify that the dijkstra unreachable node logic operates correctly."""
    topo = StadiumTopology()
    topo.edges = [e for e in topo.edges if e.source != "n-7" and e.target != "n-7"]
    path = topo._dijkstra("n-1", "n-7")
    assert path is None


def test_mutate_node_updates_density_status_and_log():
    """Verify that the mutate node updates density status and log logic operates correctly."""
    topo = StadiumTopology()

    congested = topo.mutate_node("n-1", 0.5, "crowd arrival")
    critical = topo.mutate_node("n-1", 0.5, "surge")
    optimal = topo.mutate_node("n-1", -1.0, "cleared")

    assert congested["new_status"] == "congested"
    assert critical["new_status"] == "critical"
    assert optimal["new_status"] == "optimal"
    assert topo.mutation_log[-1]["type"] == "MUTATE_NODE"


def test_mutate_node_invalid_returns_error():
    """Verify that the mutate node invalid returns error logic operates correctly."""
    topo = StadiumTopology()
    assert "error" in topo.mutate_node("missing", 0.1, "bad sensor")


def test_add_and_remove_edge_mutations():
    """Verify that the add and remove edge mutations logic operates correctly."""
    topo = StadiumTopology()

    added = topo.add_edge("n-3", "n-6", 7.0, 90.0)
    removed = topo.remove_edge("n-3", "n-6", "blocked")
    missing = topo.remove_edge("n-3", "n-6", "already gone")

    still_exists = any(edge.source == "n-3" and edge.target == "n-6" for edge in topo.edges)
    assert added["type"] == "ADD_EDGE"
    assert still_exists is False
    assert removed["success"] is True
    assert missing["success"] is False
