/**
 * @file EvacuationFlow.test.tsx
 * @description Jest test suite validating frontend EvacuationFlow component rendering and actions.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { TelemetryProvider } from "../../src/context/TelemetryContext";
import { CrisisSimulator } from "../../src/components/CrisisSimulator";
import { CommandNexus } from "../../src/components/CommandNexus";
import { NexusNode } from "../../src/types";
import "@testing-library/jest-dom";

// Mock WebSocket used by TelemetryProvider
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState = 1;
  send = jest.fn();
  close = jest.fn();
  constructor() {
    setTimeout(() => { if (this.onopen) this.onopen(); }, 10);
  }
}
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

// Mock Recharts
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: "800px", height: "400px" }}>{children}</div>
    ),
  };
});

const MOCK_NODES: NexusNode[] = [
  { id: "n-1", name: "Gate A", type: "GATE", density: 0.15, status: "optimal" },
  { id: "n-3", name: "Gate C", type: "GATE", density: 0.35, status: "optimal" },
];
const MOCK_EDGES = [
  { source: "n-1", target: "n-4", utilization: 0.4 }
];

describe("Evacuation Simulation E2E User Flow", () => {
  it("renders both regions and submits evacuation form correctly", async () => {
    const handleTrigger = jest.fn();
    const handleRAG = jest.fn();

    render(
      <TelemetryProvider>
        <div>
          <CrisisSimulator
            onTriggerSimulation={handleTrigger}
            simulationResult={null}
          />
          <CommandNexus
            nodes={MOCK_NODES}
            edges={MOCK_EDGES}
            onTriggerRAG={handleRAG}
            ragResult={null}
          />
        </div>
      </TelemetryProvider>
    );

    // Verify initial state
    expect(screen.getByRole("region", { name: /Crisis Simulator: Evacuation Router/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Command Nexus: Graph RAG Visualizer/i })).toBeInTheDocument();

    // Gate A and Gate C nodes are visible in the CommandNexus topology
    expect(screen.getByText(/Gate A/i)).toBeInTheDocument();

    // Trigger simulation
    const simBtn = screen.getByRole("button", { name: /Run Monte Carlo evacuation simulation/i });
    fireEvent.click(simBtn);
    expect(handleTrigger).toHaveBeenCalledWith(4, 0.7);

    // Trigger Graph RAG query
    const ragInput = screen.getByPlaceholderText(/e.g. Reroute volunteers/i);
    fireEvent.change(ragInput, { target: { value: "Where is Gate C?" } });
    const queryBtn = screen.getByRole("button", { name: /Submit search query to Graph RAG orchestrator/i });
    fireEvent.click(queryBtn);
    expect(handleRAG).toHaveBeenCalledWith("Where is Gate C?");

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});
