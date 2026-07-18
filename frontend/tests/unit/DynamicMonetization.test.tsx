import { render, screen } from "@testing-library/react";
import { DynamicMonetization } from "../../src/components/DynamicMonetization";
import "@testing-library/jest-dom";

// Mock ResponsiveContainer for charts
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: "800px", height: "400px" }}>{children}</div>
    ),
  };
});

describe("DynamicMonetization Unit Component", () => {
  const mockSponsorFlows = [
    { sponsorName: "Coca-Cola Booth", footfallCount: 100, revenueGenerated: 300, conversionRate: 0.5 },
    { sponsorName: "Nike Kiosk", footfallCount: 250, revenueGenerated: 750, conversionRate: 0.75 }
  ];

  it("renders with correct ARIA landmark region and sponsor data", () => {
    render(<DynamicMonetization sponsorFlows={mockSponsorFlows} />);
    const region = screen.getByRole("region", { name: /Sponsor Monetization & Footfall Stream/i });
    expect(region).toBeInTheDocument();

    // Sponsor names appear in the table
    expect(screen.getAllByText(/Coca-Cola Booth/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nike Kiosk/i).length).toBeGreaterThan(0);
  });

  it("renders zero avgConversion when sponsorFlows is empty (covers L16 branch)", () => {
    render(<DynamicMonetization sponsorFlows={[]} />);
    const region = screen.getByRole("region", { name: /Sponsor Monetization & Footfall Stream/i });
    expect(region).toBeInTheDocument();
    // The avgConversion = 0 branch is hit; region should still render
    expect(region.textContent).toMatch(/0/);
  });
});
