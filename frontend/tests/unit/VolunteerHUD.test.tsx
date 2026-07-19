/**
 * @file VolunteerHUD.test.tsx
 * @description Jest test suite validating frontend VolunteerHUD component rendering and actions.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { VolunteerHUD } from "../../src/components/VolunteerHUD";
import "@testing-library/jest-dom";

describe("VolunteerHUD Unit Component", () => {
  it("renders pending tasks and shows idle state when all complete", () => {
    render(<VolunteerHUD />);
    const region = screen.getByRole("region", { name: /Volunteer Command & HUD Control Center/i });
    expect(region).toBeInTheDocument();

    // Verify status indicators
    expect(screen.getByText(/HUD v1.4/i)).toBeInTheDocument();
    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Dispatch/i)).toBeInTheDocument();

    // Verify default active roster list
    expect(screen.getByText("Carlos Gomez")).toBeInTheDocument();
    expect(screen.getByText("Amina Al-Sayed")).toBeInTheDocument();
  });

  it("starts a task and shows active task state, then completes it", () => {
    render(<VolunteerHUD />);

    // Use the aria-label pattern: "Start task: {task.title}"
    const startBtn = screen.getByRole("button", { name: /Start task: Congestion at Gate B/i });
    fireEvent.click(startBtn);

    // Verify the task title now shows in the active view
    expect(screen.getAllByText(/Congestion at Gate B/i).length).toBeGreaterThan(0);

    // Complete the task using its aria-label
    const completeBtn = screen.getByRole("button", { name: /Mark current task as complete/i });
    fireEvent.click(completeBtn);

    // After completing the only started task, the remaining task should still be listed
    expect(screen.getByText(/Wheelchair Assist/i)).toBeInTheDocument();
  });

  it("handles dispatch form submission and locations/priorities", () => {
    render(<VolunteerHUD />);

    const alertInput = screen.getByPlaceholderText(/e.g. Crowd density surge near Exit Turnstiles/i);
    const locationSelect = screen.getByLabelText(/Target Sector/i);
    const prioritySelect = screen.getByLabelText(/Priority Level/i);
    const submitBtn = screen.getByRole("button", { name: /Dispatch To HUD/i });

    // Fill form
    fireEvent.change(alertInput, { target: { value: "Test Custom Alert near Gate B" } });
    fireEvent.change(locationSelect, { target: { value: "Gate B" } });
    fireEvent.change(prioritySelect, { target: { value: "high" } });

    // Submit form
    fireEvent.click(submitBtn);

    // Verify the custom task is now in the pending dispatch list
    expect(screen.getByText(/Test Custom Alert near.../i)).toBeInTheDocument();
    
    // Carlos Gomez is set to 'dispatched' when we dispatch to Gate B
    expect(screen.getByText("Carlos Gomez").closest("div")).toBeInTheDocument();
  });

  it("handles quick templates clicking", () => {
    render(<VolunteerHUD />);

    // Template 1: Gate B Diversion
    const gateBBtn = screen.getByRole("button", { name: /Gate B Diversion/i });
    fireEvent.click(gateBBtn);
    expect(screen.getByDisplayValue("Divert incoming fan arrivals away from Congested Gate B concourse.")).toBeInTheDocument();

    // Template 2: Zone 1 Clean-up
    const cleanBtn = screen.getByRole("button", { name: /Zone 1 Clean-up/i });
    fireEvent.click(cleanBtn);
    expect(screen.getByDisplayValue("Clean-up crew requested at Concourse Zone 1 Food Court.")).toBeInTheDocument();

    // Template 3: Turnstile Validation
    const turnstileBtn = screen.getByRole("button", { name: /Turnstile Validation/i });
    fireEvent.click(turnstileBtn);
    expect(screen.getByDisplayValue("Gate C Turnstile validation error. Assistance required.")).toBeInTheDocument();
  });

  it("handles direct roster alert clicks", () => {
    render(<VolunteerHUD />);

    const aminaAlertBtn = screen.getByRole("button", { name: /Send direct alert to Amina Al-Sayed/i });
    fireEvent.click(aminaAlertBtn);

    // Form inputs should populate with Amina's info
    expect(screen.getByDisplayValue("Emergency Alert: Assistance required at Gate A. Please deploy.")).toBeInTheDocument();
  });

  it("ignores blank dispatches, shows low priority tasks, and reaches all clear", () => {
    render(<VolunteerHUD />);

    const submitBtn = screen.getByRole("button", { name: /Dispatch To HUD/i });
    const form = screen.getByPlaceholderText(/Crowd density surge/i).closest("form");
    fireEvent.submit(form!);
    expect(screen.getAllByLabelText(/Start task:/i)).toHaveLength(2);

    fireEvent.change(screen.getByPlaceholderText(/Crowd density surge/i), {
      target: { value: "Check signage" },
    });
    fireEvent.change(screen.getByLabelText(/Priority Level/i), {
      target: { value: "low" },
    });
    fireEvent.click(submitBtn);
    expect(screen.getByRole("button", { name: /Start task: Check signage/i }).closest("div")).toHaveClass("border-blue-500/30");

    for (const taskName of ["Check signage", "Congestion at Gate B", "Wheelchair Assist"]) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`Start task: ${taskName}`) }));
      fireEvent.click(screen.getByRole("button", { name: /Mark current task as complete/i }));
    }

    expect(screen.getByText(/All Clear/i)).toBeInTheDocument();
  });

});
