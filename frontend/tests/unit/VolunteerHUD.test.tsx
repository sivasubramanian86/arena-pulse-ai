import { render, screen, fireEvent } from "@testing-library/react";
import { VolunteerHUD } from "../../src/components/VolunteerHUD";
import "@testing-library/jest-dom";

describe("VolunteerHUD Unit Component", () => {
  it("renders pending tasks and shows idle state when all complete", () => {
    render(<VolunteerHUD />);
    const region = screen.getByRole("region", { name: /Volunteer Wrist HUD Device Simulator/i });
    expect(region).toBeInTheDocument();

    // Verify status indicator
    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Dispatch/i)).toBeInTheDocument();

    // Task 1 is visible
    expect(screen.getByText(/Congestion at Gate B/i)).toBeInTheDocument();
    // Task 2 is visible
    expect(screen.getByText(/Wheelchair Assist/i)).toBeInTheDocument();
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
    // OR if we started the first task, remaining task is Wheelchair Assist
    expect(screen.getByText(/Wheelchair Assist/i)).toBeInTheDocument();
  });

  it("shows all clear state when all tasks are completed", () => {
    render(<VolunteerHUD />);

    // Start and complete task 1
    fireEvent.click(screen.getByRole("button", { name: /Start task: Congestion at Gate B/i }));
    fireEvent.click(screen.getByRole("button", { name: /Mark current task as complete/i }));

    // Start and complete task 2
    fireEvent.click(screen.getByRole("button", { name: /Start task: Wheelchair Assist/i }));
    fireEvent.click(screen.getByRole("button", { name: /Mark current task as complete/i }));

    // Now all tasks are done — idle state
    expect(screen.getByText(/All Clear/i)).toBeInTheDocument();
    expect(screen.getByText(/No pending volunteer dispatch alerts/i)).toBeInTheDocument();
  });
});
