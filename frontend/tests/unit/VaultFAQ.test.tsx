/**
 * @file VaultFAQ.test.tsx
 * @description Jest test suite validating frontend VaultFAQ component rendering and actions.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { VaultFAQ } from "../../src/components/VaultFAQ";
import "@testing-library/jest-dom";

describe("VaultFAQ Unit Component", () => {
  it("renders and supports expanding/collapsing FAQ items", () => {
    render(<VaultFAQ />);
    const region = screen.getByRole("region", { name: /Vault FAQ and System Architecture/i });
    expect(region).toBeInTheDocument();

    const faqButton = screen.getByRole("button", { name: /What is the role of Agentic Graph RAG/i });
    expect(faqButton).toBeInTheDocument();

    // Verify initially collapsed
    expect(faqButton.getAttribute("aria-expanded")).toBe("false");

    // Click to expand
    fireEvent.click(faqButton);
    expect(faqButton.getAttribute("aria-expanded")).toBe("true");

    // Click to collapse
    fireEvent.click(faqButton);
    expect(faqButton.getAttribute("aria-expanded")).toBe("false");
  });
});
