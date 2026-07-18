import { render, screen, fireEvent } from "@testing-library/react";
import { CrisisSimulator } from "../../src/components/CrisisSimulator";
import "@testing-library/jest-dom";

describe("CrisisSimulator Integration Component", () => {
  it("renders in standby state with no simulation result", () => {
    const handleTriggerSimulation = jest.fn();

    render(
      <CrisisSimulator
        onTriggerSimulation={handleTriggerSimulation}
        simulationResult={null}
      />
    );

    expect(screen.getByRole("region", { name: /Crisis Simulator: Evacuation Router/i })).toBeInTheDocument();
    expect(screen.getByText(/Standby. Configure parameters and run simulation/i)).toBeInTheDocument();
  });

  it("renders results and triggers callback on form submit", () => {
    const handleTriggerSimulation = jest.fn();
    const mockSimulationResult = {
      hazardLevel: "high" as const,
      evacuationProgress: 0.75,
      safeRoutes: [
        { path: ["Gate A", "Zone 1"], estimatedTimeSeconds: 42.5, bottleneckNodeId: null }
      ]
    };

    render(
      <CrisisSimulator
        onTriggerSimulation={handleTriggerSimulation}
        simulationResult={mockSimulationResult}
      />
    );

    // Verify evacuation progress renders using actual text from the component
    expect(screen.getByText(/75% CLEAR/i)).toBeInTheDocument();
    expect(screen.getByText(/Safety Pathway Corridor 1/i)).toBeInTheDocument();

    // Submit the form with default values (4 gates, 0.7 density)
    const submitBtn = screen.getByRole("button", { name: /Run Monte Carlo evacuation simulation/i });
    fireEvent.click(submitBtn);
    expect(handleTriggerSimulation).toHaveBeenCalledWith(4, 0.7);
  });

  it("shows validation error for invalid gate count", () => {
    const handleTriggerSimulation = jest.fn();

    render(
      <CrisisSimulator
        onTriggerSimulation={handleTriggerSimulation}
        simulationResult={null}
      />
    );

    // Set invalid gate count (0)
    const gateInput = screen.getByLabelText(/Open Exit Gates/i);
    fireEvent.change(gateInput, { target: { value: "0" } });

    const submitBtn = screen.getByRole("button", { name: /Run Monte Carlo evacuation simulation/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Must configure at least 1 open exit gate/i)).toBeInTheDocument();
    expect(handleTriggerSimulation).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid density", () => {
    const handleTriggerSimulation = jest.fn();

    render(
      <CrisisSimulator
        onTriggerSimulation={handleTriggerSimulation}
        simulationResult={null}
      />
    );

    const densityInput = screen.getByLabelText(/Initial Zone Density/i);
    fireEvent.change(densityInput, { target: { value: "0.05" } });

    const submitBtn = screen.getByRole("button", { name: /Run Monte Carlo evacuation simulation/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Initial crowd density must be at least 10%/i)).toBeInTheDocument();
    expect(handleTriggerSimulation).not.toHaveBeenCalled();
  });

  it("handles initialDensity onChange input update (covers L89 onChange handler and fallback)", () => {
    render(
      <CrisisSimulator
        onTriggerSimulation={jest.fn()}
        simulationResult={null}
      />
    );

    const densityInput = screen.getByLabelText(/Initial Zone Density/i) as HTMLInputElement;
    const gateInput = screen.getByLabelText(/Open Exit Gates/i) as HTMLInputElement;

    // Fire a valid change — covers the parseFloat path
    fireEvent.change(densityInput, { target: { value: "0.85" } });
    expect(densityInput.value).toBe("0.85");

    // Fire an empty value change — covers the || 0 fallback path
    fireEvent.change(densityInput, { target: { value: "" } });
    expect(densityInput.value).toBe("0");

    // Fire an empty value on gateCount — covers the || 0 fallback path
    fireEvent.change(gateInput, { target: { value: "" } });
    expect(gateInput.value).toBe("0");
  });
});
