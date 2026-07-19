/**
 * @file FanPass.test.tsx
 * @description Jest test suite validating frontend FanPass component rendering and actions.
 */

import { render, screen } from "@testing-library/react";
import { FanPass } from "../../src/components/FanPass";
import "@testing-library/jest-dom";

describe("FanPass Unit Component", () => {
  it("renders with correct ARIA landmark region", () => {
    render(<FanPass />);

    // Verify main region
    const region = screen.getByRole("region", { name: /FanPass AR Wayfinder and Ticket/i });
    expect(region).toBeInTheDocument();

    // Verify maps link exists
    const mapsLink = screen.getByLabelText(/Get directions to MetLife Stadium on Google Maps/i);
    expect(mapsLink).toBeInTheDocument();
  });
});
