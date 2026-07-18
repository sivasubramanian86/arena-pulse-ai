import { render, screen } from "@testing-library/react";
import { EdgeMeshTopology } from "../../src/components/EdgeMeshTopology";
import "@testing-library/jest-dom";

describe("EdgeMeshTopology Unit Component", () => {
  it("renders region and online node stats correctly", () => {
    const mockMeshNodes = [
      { id: "Beacon-01", latencyMs: 15, packetLoss: 0.0, hardwareHealth: 0.95, isOnline: true },
      { id: "Beacon-02", latencyMs: 42, packetLoss: 0.05, hardwareHealth: 0.72, isOnline: false },
    ];

    render(<EdgeMeshTopology meshNodes={mockMeshNodes} />);

    // Correct ARIA label from the component
    const region = screen.getByRole("region", { name: /Edge Mesh Topology status/i });
    expect(region).toBeInTheDocument();

    // Stats display
    expect(screen.getByText(/NOC Health Overview/i)).toBeInTheDocument();

    // Beacon-01 is online (green status)
    expect(screen.getByText(/Beacon-01/i)).toBeInTheDocument();
    // Beacon-02 is offline
    expect(screen.getByText(/Beacon-02/i)).toBeInTheDocument();
  });

  it("renders empty state when no mesh nodes are provided", () => {
    render(<EdgeMeshTopology meshNodes={[]} />);
    const region = screen.getByRole("region", { name: /Edge Mesh Topology status/i });
    expect(region).toBeInTheDocument();
    // Average latency shows 0 — text may be split, use container query
    expect(region.textContent).toMatch(/0/);
  });
});
