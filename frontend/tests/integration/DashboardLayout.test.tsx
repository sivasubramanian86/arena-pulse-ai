import { render, screen, fireEvent, act } from "@testing-library/react";
import { DashboardLayout } from "../../src/components/DashboardLayout";
import { TelemetryProvider } from "../../src/context/TelemetryContext";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/nexus",
}));

// Mock WebSocket so TelemetryProvider works in tests
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState = 1;
  send = jest.fn();
  close = jest.fn();
  constructor() {
    setTimeout(() => { if (this.onopen) this.onopen(); }, 10);
  }
}
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

describe("DashboardLayout Integration Component", () => {
  it("renders layout elements and supports theme toggling", () => {
    render(
      <TelemetryProvider>
        <DashboardLayout>
          <div data-testid="child-content">Child Content</div>
        </DashboardLayout>
      </TelemetryProvider>
    );

    // Verify main landmarks
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("application")).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();

    // Verify dark mode toggle
    const toggleBtn = screen.getByRole("button", { name: /Toggle Light\/Dark operational layout/i });
    expect(toggleBtn).toBeInTheDocument();

    // Toggle click to light mode — covers the !wsConnected path too since wsConnected=false initially in mocked env
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // Toggle click back to dark mode
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("renders DEGRADED status when WS is disconnected (initial mock state)", () => {
    // MockWebSocket starts disconnected — wsConnected=false from context until 'open' fires
    // We need a WS that never fires onopen to get the disconnected branch
    class DisconnectedWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: (() => void) | null = null;
      readyState = 3; // CLOSED
      send = jest.fn();
      close = jest.fn();
    }
    global.WebSocket = DisconnectedWS as unknown as typeof WebSocket;

    render(
      <TelemetryProvider>
        <DashboardLayout>
          <div>child</div>
        </DashboardLayout>
      </TelemetryProvider>
    );

    // Initially disconnected — should show DEGRADED
    expect(screen.getByText(/DEGRADED/i)).toBeInTheDocument();

    // Restore
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  it("renders warning and error log levels in the audit console", async () => {
    // We need to inject logs with warning + error levels into the context
    // Use the mock WS to send audit_log messages with those levels
    class LogInjectWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((e: MessageEvent) => void) | null = null;
      readyState = 1;
      send = jest.fn();
      close = jest.fn();
      constructor() {
        setTimeout(() => {
          // Fire open
          if (this.onopen) this.onopen();
          // Send warning log
          if (this.onmessage) {
            this.onmessage(new MessageEvent("message", {
              data: JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "audit_log",
                payload: { level: "warning", message: "Gate B congestion warning", component: "CrowdWorker" }
              })
            }));
          }
          // Send error log
          if (this.onmessage) {
            this.onmessage(new MessageEvent("message", {
              data: JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "audit_log",
                payload: { level: "error", message: "NOC connection error", component: "TransitWorker" }
              })
            }));
          }
          // Send success log
          if (this.onmessage) {
            this.onmessage(new MessageEvent("message", {
              data: JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "audit_log",
                payload: { level: "success", message: "Successfully rerouted flow", component: "OpsCommanderAgent" }
              })
            }));
          }
        }, 10);
      }
    }
    global.WebSocket = LogInjectWS as unknown as typeof WebSocket;

    render(
      <TelemetryProvider>
        <DashboardLayout>
          <div>child</div>
        </DashboardLayout>
      </TelemetryProvider>
    );

    // Wait for the setTimeout to run and react state to update
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByText(/Gate B congestion warning/i)).toBeInTheDocument();
    expect(screen.getByText(/NOC connection error/i)).toBeInTheDocument();
    expect(screen.getByText(/Successfully rerouted flow/i)).toBeInTheDocument();
    expect(screen.getByText(/TELEMETRY LIVE/i)).toBeInTheDocument();

    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  it("supports changing the operational role profile", () => {
    render(
      <TelemetryProvider>
        <DashboardLayout>
          <div>child</div>
        </DashboardLayout>
      </TelemetryProvider>
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("noc_director");

    // Change to volunteer role
    fireEvent.change(select, { target: { value: "volunteer" } });
    expect(select).toHaveValue("volunteer");
  });
});
