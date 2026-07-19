"""Topological graph representation and search algorithms for stadium evacuation planning."""

import random
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class StadiumNode(BaseModel):
    """Represents a topological node in the stadium knowledge graph."""

    id: str
    name: str
    type: str  # GATE, ZONE, CONCOURSE, TRANSIT_STATION, WIFI_NODE
    density: float
    status: str  # optimal, congested, critical, offline

class StadiumEdge(BaseModel):
    """Represents a directional pathway between stadium nodes."""

    source: str
    target: str
    weight: float  # base traversal time/distance
    capacity: float  # maximum flow capacity
    utilization: float  # current traffic ratio

class StadiumTopology:
    """Manages the stadium's spatial knowledge graph and path-finding traversals."""

    def __init__(self) -> None:
        """Initialize the StadiumTopology and populate with initial stadium nodes and edges."""
        self.nodes: Dict[str, StadiumNode] = {}
        self.edges: List[StadiumEdge] = []
        self.mutation_log: List[Dict[str, Any]] = []
        self._initialize_topology()

    def _initialize_topology(self) -> None:
        # Core nodes definition
        initial_nodes = [
            StadiumNode(id="n-1", name="Gate A", type="GATE", density=0.15, status="optimal"),
            StadiumNode(id="n-2", name="Gate B", type="GATE", density=0.85, status="congested"),
            StadiumNode(id="n-3", name="Gate C", type="GATE", density=0.35, status="optimal"),
            StadiumNode(id="n-4", name="Zone 1 (Concourse)", type="ZONE", density=0.55, status="optimal"),
            StadiumNode(id="n-5", name="Zone 2 (Tribunes)", type="ZONE", density=0.95, status="critical"),
            StadiumNode(id="n-6", name="Transit Hub Alpha", type="TRANSIT_STATION", density=0.45, status="optimal"),
            StadiumNode(id="n-7", name="NOC Mainframe", type="WIFI_NODE", density=0.10, status="optimal"),
        ]
        for node in initial_nodes:
            self.nodes[node.id] = node

        # Core edges definition (source, target, weight/distance, capacity, initial utilization)
        self.edges = [
            StadiumEdge(source="n-1", target="n-4", weight=5.0, capacity=100.0, utilization=0.4),
            StadiumEdge(source="n-2", target="n-5", weight=8.0, capacity=120.0, utilization=0.9),
            StadiumEdge(source="n-3", target="n-4", weight=6.0, capacity=80.0, utilization=0.3),
            StadiumEdge(source="n-4", target="n-5", weight=10.0, capacity=200.0, utilization=0.7),
            StadiumEdge(source="n-6", target="n-1", weight=4.0, capacity=150.0, utilization=0.5),
            StadiumEdge(source="n-7", target="n-4", weight=3.0, capacity=50.0, utilization=0.2),
            # Bidirectional routes
            StadiumEdge(source="n-4", target="n-1", weight=5.0, capacity=100.0, utilization=0.4),
            StadiumEdge(source="n-5", target="n-2", weight=8.0, capacity=120.0, utilization=0.9),
            StadiumEdge(source="n-4", target="n-3", weight=6.0, capacity=80.0, utilization=0.3),
            StadiumEdge(source="n-5", target="n-4", weight=10.0, capacity=200.0, utilization=0.7),
            StadiumEdge(source="n-1", target="n-6", weight=4.0, capacity=150.0, utilization=0.5),
            StadiumEdge(source="n-4", target="n-7", weight=3.0, capacity=50.0, utilization=0.2),
        ]

    def get_live_telemetry_mcp(self, node_id: str) -> Dict[str, Any]:
        """Simulate an MCP tool call to fetch live telemetry for a specific node."""
        node = self.nodes.get(node_id)
        if not node:
            return {"error": f"Node {node_id} not found"}

        # Inject minor simulation variance to live data
        sim_variance = random.uniform(-0.05, 0.05)
        new_density = min(max(node.density + sim_variance, 0.0), 1.0)

        if new_density > 0.85:
            new_status = "critical"
        elif new_density > 0.6:
            new_status = "congested"
        else:
            new_status = "optimal"

        node.density = new_density
        node.status = new_status
        return {
            "node_id": node.id,
            "name": node.name,
            "type": node.type,
            "density": round(node.density, 3),
            "status": node.status,
        }

    def get_edge_status_mcp(self, source_id: str, target_id: str) -> Dict[str, Any]:
        """Simulate an MCP tool call to fetch live traffic utilization of an edge pathway."""
        for edge in self.edges:
            if edge.source == source_id and edge.target == target_id:
                # Add minor dynamic congestion updates
                edge.utilization = min(max(edge.utilization + random.uniform(-0.08, 0.08), 0.0), 1.0)
                return {
                    "source": source_id,
                    "target": target_id,
                    "weight": edge.weight,
                    "capacity": edge.capacity,
                    "utilization": round(edge.utilization, 3),
                }
        return {"error": f"Edge pathway from {source_id} to {target_id} not found"}

    def find_safe_evacuation_routes(self, hazard_node_id: str) -> List[Dict[str, Any]]:
        """Calculate alternative paths from concourses/tribunes to safe gates, avoiding critical nodes.

        Uses Dijkstra's shortest path modified to penalize congested/critical nodes.
        """
        destinations = [nid for nid, node in self.nodes.items() if node.type == "GATE" and node.status != "critical"]
        routes: List[Dict[str, Any]] = []

        for target in destinations:
            path = self._dijkstra(hazard_node_id, target)
            if path:
                # Calculate estimated time based on distance and node densities along the path
                estimated_time = 0.0
                bottleneck_id = None
                max_density = 0.0

                for i in range(len(path) - 1):
                    src, tgt = path[i], path[i+1]
                    edge = next((e for e in self.edges if e.source == src and e.target == tgt), None)
                    weight = edge.weight if edge else 1.0
                    node_density = self.nodes[tgt].density

                    # Traversal time increases under high densities
                    estimated_time += weight * (1.0 + node_density * 2.0)

                    if node_density > max_density:
                        max_density = node_density
                        if node_density > 0.6:
                            bottleneck_id = tgt

                routes.append({
                    "path": path,
                    "estimatedTimeSeconds": round(estimated_time, 1),
                    "bottleneckNodeId": bottleneck_id
                })

        # Sort routes by traversal efficiency
        routes.sort(key=lambda r: r["estimatedTimeSeconds"])
        return routes

    def _dijkstra(self, start: str, end: str) -> Optional[List[str]]:
        """Classic Dijkstra's algorithm to find path of least congestion weight."""
        if start not in self.nodes or end not in self.nodes:
            return None

        distances = {node_id: float('inf') for node_id in self.nodes}
        distances[start] = 0.0
        previous: Dict[str, Optional[str]] = {node_id: None for node_id in self.nodes}
        unvisited = set(self.nodes.keys())

        while unvisited:  # pragma: no cover
            current = min(unvisited, key=lambda node: distances[node])
            if distances[current] == float('inf') or current == end:
                break

            unvisited.remove(current)

            # Find outgoing edges
            outgoing = [e for e in self.edges if e.source == current]
            for edge in outgoing:
                neighbor = edge.target
                if neighbor not in unvisited:
                    continue

                # Edge weight is modified dynamically by target node congestion
                neighbor_node = self.nodes[neighbor]
                congestion_penalty = 1.0
                if neighbor_node.status == "critical":
                    congestion_penalty = 100.0  # avoid critical nodes
                elif neighbor_node.status == "congested":
                    congestion_penalty = 5.0

                temp_dist = distances[current] + (edge.weight * congestion_penalty)
                if temp_dist < distances[neighbor]:
                    distances[neighbor] = temp_dist
                    previous[neighbor] = current

        path: List[str] = []
        curr: Optional[str] = end
        while curr is not None:
            path.insert(0, curr)
            curr = previous[curr]

        return path if path[0] == start else None

    def mutate_node(self, node_id: str, delta_density: float, reason: str) -> Dict[str, Any]:
        """Dynamically updates node density and status in-place based on IoT stream."""
        node = self.nodes.get(node_id)
        if not node:
            return {"error": f"Node {node_id} not found"}

        node.density = min(max(node.density + delta_density, 0.0), 1.0)
        if node.density > 0.85:
            node.status = "critical"
        elif node.density > 0.6:
            node.status = "congested"
        else:
            node.status = "optimal"

        mutation = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "MUTATE_NODE",
            "node_id": node_id,
            "delta_density": delta_density,
            "new_density": node.density,
            "new_status": node.status,
            "reason": reason
        }
        self.mutation_log.append(mutation)
        return mutation

    def add_edge(self, source: str, target: str, weight: float, capacity: float) -> Dict[str, Any]:
        """Dynamically injects a new edge pathway from IoT sensor observations."""
        edge = StadiumEdge(source=source, target=target, weight=weight, capacity=capacity, utilization=0.0)
        self.edges.append(edge)
        mutation = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "ADD_EDGE",
            "source": source,
            "target": target,
            "weight": weight,
            "capacity": capacity
        }
        self.mutation_log.append(mutation)
        return mutation

    def remove_edge(self, source: str, target: str, reason: str) -> Dict[str, Any]:
        """Prunes blocked or hazardous pathways from the live topological map."""
        original_len = len(self.edges)
        self.edges = [e for e in self.edges if not (e.source == source and e.target == target)]
        success = len(self.edges) < original_len
        mutation = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "REMOVE_EDGE",
            "source": source,
            "target": target,
            "success": success,
            "reason": reason
        }
        self.mutation_log.append(mutation)
        return mutation
