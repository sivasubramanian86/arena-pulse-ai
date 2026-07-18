import { render, screen, fireEvent } from "@testing-library/react";
import { CommandNexus } from "../../src/components/CommandNexus";
import { NexusNode } from "../../src/types";
import "@testing-library/jest-dom";

describe("CommandNexus Integration Component", () => {
  const mockNodes: NexusNode[] = [
    { id: "n-1", name: "Gate A", type: "GATE", density: 0.15, status: "optimal" },
    { id: "n-2", name: "Gate B", type: "GATE", density: 0.85, status: "congested" },
    { id: "n-3", name: "Gate C", type: "GATE", density: 0.35, status: "optimal" },
    { id: "n-4", name: "Zone 1 (Concourse)", type: "ZONE", density: 0.55, status: "optimal" },
    { id: "n-5", name: "Zone 2 (Tribunes)", type: "ZONE", density: 0.95, status: "critical" },
    { id: "n-6", name: "Transit Hub Alpha", type: "TRANSIT_STATION", density: 0.45, status: "optimal" },
    { id: "n-7", name: "NOC Mainframe", type: "WIFI_NODE", density: 0.10, status: "offline" },
    { id: "n-8", name: "Sector X", type: "ZONE", density: 0.30, status: "optimal" },  // triggers default case
  ];
  const mockEdges = [
    { source: "n-1", target: "n-4", utilization: 0.4 },   // Gate A → Zone 1
    { source: "n-2", target: "n-5", utilization: 0.9 },   // Gate B → Zone 2 (high util → amber stroke)
    { source: "n-3", target: "n-6", utilization: 0.3 },   // Gate C → Transit Hub
    { source: "n-7", target: "n-8", utilization: 0.2 },   // NOC → Sector X (NOC + default cases)
  ];

  it("renders region, node metrics, and topology map", () => {
    render(
      <CommandNexus
        nodes={mockNodes}
        edges={mockEdges}
        onTriggerRAG={jest.fn()}
        ragResult={null}
      />
    );

    expect(screen.getByRole("region", { name: /Command Nexus: Graph RAG Visualizer/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Gate A/i).length).toBeGreaterThan(0);
    // Stats bar shows congested + offline counts
    expect(screen.getByText(/Congested:/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline:/i)).toBeInTheDocument();
  });

  it("shows validation error when query is too short", () => {
    render(
      <CommandNexus
        nodes={mockNodes}
        edges={mockEdges}
        onTriggerRAG={jest.fn()}
        ragResult={null}
      />
    );

    const queryInput = screen.getByPlaceholderText(/e.g. Reroute volunteers/i);
    fireEvent.change(queryInput, { target: { value: "A" } });

    const submitBtn = screen.getByRole("button", { name: /Submit search query to Graph RAG orchestrator/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Query must be at least 2 characters long/i)).toBeInTheDocument();
  });

  it("clears validation error when user types after failed submit", () => {
    render(
      <CommandNexus
        nodes={mockNodes}
        edges={mockEdges}
        onTriggerRAG={jest.fn()}
        ragResult={null}
      />
    );

    const queryInput = screen.getByPlaceholderText(/e.g. Reroute volunteers/i);
    fireEvent.change(queryInput, { target: { value: "A" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit search query to Graph RAG orchestrator/i }));

    // Error is shown
    expect(screen.getByText(/Query must be at least 2 characters long/i)).toBeInTheDocument();

    // Now type more — error should clear
    fireEvent.change(queryInput, { target: { value: "AB" } });
    expect(screen.queryByText(/Query must be at least 2 characters long/i)).not.toBeInTheDocument();
  });

  it("calls onTriggerRAG with valid query and renders RAG result", () => {
    const handleTriggerRAG = jest.fn();
    const mockRagResult = {
      answer: "Sample RAG response details.",
      sources: ["Mock DB"],
      confidence: 0.95,
      thinkingSteps: ["Mock step 1"]
    };

    render(
      <CommandNexus
        nodes={mockNodes}
        edges={mockEdges}
        onTriggerRAG={handleTriggerRAG}
        ragResult={mockRagResult}
      />
    );

    // RAG result panel renders
    expect(screen.getByText(/Sample RAG response details/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 95%/i)).toBeInTheDocument();
    expect(screen.getByText(/Mock step 1/i)).toBeInTheDocument();

    const queryInput = screen.getByPlaceholderText(/e.g. Reroute volunteers/i);
    fireEvent.change(queryInput, { target: { value: "Where is Gate C?" } });

    const submitBtn = screen.getByRole("button", { name: /Submit search query to Graph RAG orchestrator/i });
    fireEvent.click(submitBtn);

    expect(handleTriggerRAG).toHaveBeenCalledWith("Where is Gate C?");
  });

  it("handles node hover interactions — all status colors (optimal, congested, critical, offline)", () => {
    render(
      <CommandNexus
        nodes={mockNodes}
        edges={mockEdges}
        onTriggerRAG={jest.fn()}
        ragResult={null}
      />
    );

    // Gate A (optimal) → green tooltip
    const optimalBtn = screen.getByRole("button", { name: /Node: Gate A/i });
    fireEvent.mouseEnter(optimalBtn);
    expect(screen.getAllByText(/Gate A/i).length).toBeGreaterThan(0);
    fireEvent.mouseLeave(optimalBtn);

    // Gate B (congested) → amber tooltip  [covers L271]
    const congestedBtn = screen.getByRole("button", { name: /Node: Gate B/i });
    fireEvent.mouseEnter(congestedBtn);
    expect(screen.getByText("CONGESTED")).toBeInTheDocument();
    fireEvent.mouseLeave(congestedBtn);

    // Zone 2 Tribunes (critical) → red tooltip  [covers L272]
    const criticalBtn = screen.getByRole("button", { name: /Node: Zone 2 \(Tribunes\)/i });
    fireEvent.mouseEnter(criticalBtn);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    fireEvent.mouseLeave(criticalBtn);

    // NOC Mainframe (offline) → zinc tooltip  [covers else branch]
    const offlineBtn = screen.getByRole("button", { name: /Node: NOC Mainframe/i });
    fireEvent.mouseEnter(offlineBtn);
    expect(screen.getByText("OFFLINE")).toBeInTheDocument();
    fireEvent.mouseLeave(offlineBtn);
  });
});
