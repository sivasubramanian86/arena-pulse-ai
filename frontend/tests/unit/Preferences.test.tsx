/**
 * @file Preferences.test.tsx
 * @description Jest test suite validating frontend Preferences component rendering and actions.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { Preferences } from "../../src/components/Preferences";
import "@testing-library/jest-dom";

describe("Preferences Unit Component", () => {
  it("renders the region and all form fields", () => {
    render(<Preferences />);
    expect(screen.getByRole("region", { name: /System Settings and IoT Config/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/IoT Telemetry Poll Frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telemetry Retention Period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enable Offline Edge Mesh Fallback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Consent to anonymized crowd analytics tracking/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save IoT preferences/i })).toBeInTheDocument();
  });

  it("shows IoT interval validation error when interval is 0", () => {
    render(<Preferences />);
    const intervalInput = screen.getByLabelText(/IoT Telemetry Poll Frequency/i);
    const saveButton = screen.getByRole("button", { name: /Save IoT preferences/i });

    fireEvent.change(intervalInput, { target: { name: "iotInterval", value: "0", type: "number" } });
    fireEvent.click(saveButton);

    expect(screen.getByText(/Interval must be at least 1 second/i)).toBeInTheDocument();
  });

  it("shows privacy consent error when unchecked", () => {
    render(<Preferences />);
    const consentCheckbox = screen.getByLabelText(/Consent to anonymized crowd analytics tracking/i);
    const saveButton = screen.getByRole("button", { name: /Save IoT preferences/i });

    // Uncheck by clicking (RTL checkbox toggle uses click, not change)
    fireEvent.click(consentCheckbox);
    fireEvent.click(saveButton);

    expect(screen.getByText(/You must consent to operational data sharing/i)).toBeInTheDocument();
  });

  it("shows success alert after valid form submission", async () => {
    render(<Preferences />);
    const saveButton = screen.getByRole("button", { name: /Save IoT preferences/i });

    // Default values are valid — just click save
    fireEvent.click(saveButton);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Preferences saved successfully/i)).toBeInTheDocument();

    // Wait for the success toast timeout to hide it (3000ms in component)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 3100));
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears field error when user edits the field after a failed submit", () => {
    render(<Preferences />);
    const intervalInput = screen.getByLabelText(/IoT Telemetry Poll Frequency/i);
    const saveButton = screen.getByRole("button", { name: /Save IoT preferences/i });

    // Trigger error using type: "text" to cover the name === "iotInterval" branch
    fireEvent.change(intervalInput, { target: { name: "iotInterval", value: "0", type: "text" } });
    fireEvent.click(saveButton);
    expect(screen.getByText(/Interval must be at least 1 second/i)).toBeInTheDocument();

    // Fix the error by typing a valid value
    fireEvent.change(intervalInput, { target: { name: "iotInterval", value: "10", type: "number" } });
    expect(screen.queryByText(/Interval must be at least 1 second/i)).not.toBeInTheDocument();
  });

  it("toggles edgeMode checkbox", () => {
    render(<Preferences />);
    const edgeCheckbox = screen.getByLabelText(/Enable Offline Edge Mesh Fallback/i) as HTMLInputElement;
    expect(edgeCheckbox.checked).toBe(true);

    // Toggle off
    fireEvent.click(edgeCheckbox);
    expect(edgeCheckbox.checked).toBe(false);

    // Toggle back on
    fireEvent.click(edgeCheckbox);
    expect(edgeCheckbox.checked).toBe(true);
  });

  it("shows dataRetentionDays validation error when value is 0 (covers L115-117)", () => {
    render(<Preferences />);
    const retentionInput = screen.getByLabelText(/Telemetry Retention Period/i);
    const saveButton = screen.getByRole("button", { name: /Save IoT preferences/i });

    // Trigger error using type: "text" to cover the name === "dataRetentionDays" branch
    fireEvent.change(retentionInput, { target: { name: "dataRetentionDays", value: "0", type: "text" } });
    fireEvent.click(saveButton);

    expect(screen.getByText(/Data retention must be at least 1 day/i)).toBeInTheDocument();
  });
});

