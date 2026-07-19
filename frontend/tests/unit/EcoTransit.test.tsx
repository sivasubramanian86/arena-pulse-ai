/**
 * @file EcoTransit.test.tsx
 * @description Jest test suite validating frontend EcoTransit component rendering and actions.
 */

import { render, screen } from "@testing-library/react";
import { EcoTransit } from "../../src/components/EcoTransit";
import "@testing-library/jest-dom";

describe("EcoTransit Unit Component", () => {
  it("renders with correct ARIA landmark region", () => {
    render(<EcoTransit />);
    const region = screen.getByRole("region", { name: /EcoTransit: Sustainability Matrix & Transit Gantt/i });
    expect(region).toBeInTheDocument();
  });
});
