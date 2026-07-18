import { render, screen } from "@testing-library/react";
import { WowFeatures } from "../../src/components/WowFeatures";
import "@testing-library/jest-dom";

describe("WowFeatures Unit Component", () => {
  it("renders all operational impact metrics and check accessibility", () => {
    render(<WowFeatures />);
    
    // Check main region
    expect(screen.getByRole("region", { name: /FIFA Smart Stadium AI Operational Impact metrics/i })).toBeInTheDocument();
    
    // Check header text
    expect(screen.getByText("FIFA Smart Stadium Operational Impact")).toBeInTheDocument();
    expect(screen.getByText("Powered by Gemini 2.5 + ADK", { exact: false })).toBeInTheDocument();

    // Check specific metric values
    expect(screen.getByText("82.4")).toBeInTheDocument();
    expect(screen.getByText("% Uplink Saved")).toBeInTheDocument();

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("% Auto-Negotiated")).toBeInTheDocument();

    expect(screen.getByText("4,250")).toBeInTheDocument();
    expect(screen.getByText("Fans / Min")).toBeInTheDocument();

    expect(screen.getByText("94.1")).toBeInTheDocument();
    expect(screen.getByText("% Load Reduced")).toBeInTheDocument();
  });
});
