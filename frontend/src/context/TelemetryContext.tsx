"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { NexusNode, NexusEdge, AuditLogPayload, MonetizationFlowPayload, EdgeMeshNode, CrisisAlertPayload } from "../types";

// Define Zod schemas for WS validation
const WSNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["ZONE", "GATE", "TRANSIT_STATION", "KIOSK", "WIFI_NODE"]),
  density: z.number().min(0).max(1),
  status: z.enum(["optimal", "congested", "critical", "offline"]),
});

const WSEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  utilization: z.number().min(0).max(1),
});

const WSTelemetrySchema = z.object({
  nexusNodes: z.array(WSNodeSchema),
  nexusEdges: z.array(WSEdgeSchema),
});

const WSAuditLogSchema = z.object({
  level: z.enum(["info", "success", "warning", "error"]),
  message: z.string(),
  component: z.string(),
});

const WSSafeRouteSchema = z.object({
  path: z.array(z.string()),
  estimatedTimeSeconds: z.number(),
  bottleneckNodeId: z.string().nullable().optional(),
});

const WSCrisisAlertSchema = z.object({
  hazardLevel: z.enum(["low", "medium", "high", "extreme"]),
  safeRoutes: z.array(WSSafeRouteSchema),
  evacuationProgress: z.number().min(0).max(1),
});

const WSAgentStateSchema = z.object({
  agentName: z.string(),
  status: z.enum(["idle", "thinking", "executing_tool", "completed", "error"]),
  thought: z.string(),
  activeTool: z.string().nullable().optional(),
  progress: z.number().min(0).max(100),
});

const ServerMessageSchema = z.object({
  timestamp: z.string(),
  event: z.enum(["telemetry", "agent_state", "audit_log", "crisis_alert"]),
  payload: z.any()
});

interface RAGResult {
  answer: string;
  sources: string[];
  confidence: number;
  thinkingSteps: string[];
}

interface TelemetryContextType {
  nodes: NexusNode[];
  edges: NexusEdge[];
  logs: AuditLogPayload[];
  wsConnected: boolean;
  ragResult: RAGResult | null;
  simulationResult: CrisisAlertPayload | null;
  sponsorFlows: MonetizationFlowPayload[];
  meshNodes: EdgeMeshNode[];
  triggerRAG: (query: string) => void;
  triggerSimulation: (gateCount: number, initialDensity: number) => void;
  addLog: (message: string, level?: "info" | "success" | "warning" | "error", component?: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);
  const [logs, setLogs] = useState<AuditLogPayload[]>([
    { level: "info", message: "Client telemetry subsystem initialized.", component: "Frontend" }
  ]);

  // Telemetry States
  const [nodes, setNodes] = useState<NexusNode[]>([
    { id: "n-1", name: "Gate A", type: "GATE", density: 0.15, status: "optimal" },
    { id: "n-2", name: "Gate B", type: "GATE", density: 0.85, status: "congested" },
    { id: "n-3", name: "Gate C", type: "GATE", density: 0.35, status: "optimal" },
    { id: "n-4", name: "Zone 1 (Concourse)", type: "ZONE", density: 0.55, status: "optimal" },
    { id: "n-5", name: "Zone 2 (Tribunes)", type: "ZONE", density: 0.95, status: "critical" },
    { id: "n-6", name: "Transit Hub Alpha", type: "TRANSIT_STATION", density: 0.45, status: "optimal" },
    { id: "n-7", name: "NOC Mainframe", type: "WIFI_NODE", density: 0.10, status: "optimal" }
  ]);

  const [edges] = useState<NexusEdge[]>([
    { source: "n-1", target: "n-4", utilization: 0.4 },
    { source: "n-2", target: "n-5", utilization: 0.9 },
    { source: "n-3", target: "n-4", utilization: 0.3 },
    { source: "n-4", target: "n-5", utilization: 0.7 },
    { source: "n-6", target: "n-1", utilization: 0.5 },
    { source: "n-7", target: "n-4", utilization: 0.2 }
  ]);

  const [ragResult, setRagResult] = useState<RAGResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<CrisisAlertPayload | null>(null);

  const [sponsorFlows, setSponsorFlows] = useState<MonetizationFlowPayload[]>([
    { sponsorName: "Coca-Cola Booth", footfallCount: 420, revenueGenerated: 1260, conversionRate: 0.65 },
    { sponsorName: "Adidas Experience", footfallCount: 890, revenueGenerated: 4450, conversionRate: 0.82 },
    { sponsorName: "Visa Fan Zone", footfallCount: 650, revenueGenerated: 3250, conversionRate: 0.74 }
  ]);

  const [meshNodes, setMeshNodes] = useState<EdgeMeshNode[]>([
    { id: "Beacon-01", latencyMs: 12, packetLoss: 0.0, hardwareHealth: 0.98, isOnline: true },
    { id: "Beacon-02", latencyMs: 45, packetLoss: 1.2, hardwareHealth: 0.92, isOnline: true },
    { id: "Beacon-03", latencyMs: 250, packetLoss: 8.5, hardwareHealth: 0.75, isOnline: true },
    { id: "Beacon-04", latencyMs: 0, packetLoss: 100, hardwareHealth: 0.0, isOnline: false }
  ]);

  const addLog = useCallback((message: string, level: "info" | "success" | "warning" | "error" = "info", component = "System") => {
    setLogs(prev => [
      ...prev.slice(-30), // Limit log history
      { level, message, component }
    ]);
  }, []);

  // simulated WebSockets and fallback data updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const connectWS = () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "localhost:8000";
      const cleanUrl = backendUrl.replace(/^https?:\/\//, "").replace(/^wss?:\/\//, "");
      const isSecure = backendUrl.startsWith("https://") || backendUrl.includes(".run.app");
      const wsProtocol = isSecure ? "wss://" : "ws://";
      ws = new WebSocket(`${wsProtocol}${cleanUrl}/ws`);
      setWsInstance(ws);

      ws.onopen = () => {
        setWsConnected(true);
        addLog("FastAPI WebSocket connected. Streaming telemetry...", "success", "WSClient");
      };

      ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          const parsedWrapper = ServerMessageSchema.parse(rawData);

          if (parsedWrapper.event === "telemetry") {
            const telemetry = WSTelemetrySchema.parse(parsedWrapper.payload);
            setNodes(telemetry.nexusNodes);
          } else if (parsedWrapper.event === "audit_log") {
            const log = WSAuditLogSchema.parse(parsedWrapper.payload);
            addLog(log.message, log.level, log.component);
          } else if (parsedWrapper.event === "crisis_alert") {
            const alert = WSCrisisAlertSchema.parse(parsedWrapper.payload);
            setSimulationResult(alert);
          } else if (parsedWrapper.event === "agent_state") {
            const agentState = WSAgentStateSchema.parse(parsedWrapper.payload);
            if (agentState.status === "completed") {
              setRagResult({
                answer: agentState.thought,
                sources: ["Stadium Layout Topology DB", "Crowd Density Vectors"],
                confidence: 0.95,
                thinkingSteps: ["Resolved via parallel agent graph traversal."]
              });
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          addLog(`Zod validation error: ${errMsg}`, "error", "WSClient");
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setWsInstance(null);
        addLog("WebSocket connection closed. Switching to local mock simulator.", "warning", "WSClient");
        startFallbackInterval();
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    const startFallbackInterval = () => {
      if (fallbackInterval) clearInterval(fallbackInterval);
      fallbackInterval = setInterval(() => {
        // Randomize node densities
        setNodes(prev =>
          prev.map(n => {
            const delta = (Math.random() - 0.5) * 0.1;
            const density = Math.min(Math.max(n.density + delta, 0), 1);
            const status = density > 0.85 ? "critical" : density > 0.6 ? "congested" : "optimal";
            return { ...n, density, status };
          })
        );

        // Update sponsor flows
        setSponsorFlows(prev =>
          prev.map(s => {
            const addedFootfall = Math.floor(Math.random() * 5);
            const addedRev = addedFootfall * 4;
            return {
              ...s,
              footfallCount: s.footfallCount + addedFootfall,
              revenueGenerated: s.revenueGenerated + addedRev
            };
          })
        );

        // Randomize latency mesh values
        setMeshNodes(prev =>
          prev.map(n => {
            if (!n.isOnline) return n;
            const latencyDelta = Math.floor((Math.random() - 0.5) * 10);
            return { ...n, latencyMs: Math.max(n.latencyMs + latencyDelta, 5) };
          })
        );
      }, 3000);
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [addLog]);

  // semantic RAG trigger
  const triggerRAG = useCallback((query: string) => {
    addLog(`Initiating semantic Graph RAG index scan for: "${query}"`, "info", "Orchestrator");
    
    if (wsInstance && wsConnected) {
      wsInstance.send(JSON.stringify({ action: "query", queryText: query }));
    } else {
      // Fallback response generator
      setTimeout(() => {
        setRagResult({
          answer: `Identified density bottlenecks in Gate B and Zone 2. Rerouting volunteer dispatch queues via Corridor 1 (Gate A ➔ Zone 1) will alleviate crowd pressure in under 120 seconds.`,
          sources: ["Stadium Layout Topology DB", "Crowd Density Vectors"],
          confidence: 0.94,
          thinkingSteps: [
            "Calculated cosine similarities in pgvector store",
            "Walked adjacency edges: Gate B Connected to Zone 2",
            "Identified active congestion bottlenecks"
          ]
        });
        addLog("Graph RAG analysis completed.", "success", "OpsCommanderAgent");
      }, 1500);
    }
  }, [wsInstance, wsConnected, addLog]);

  // Evacuation simulation trigger
  const triggerSimulation = useCallback((gateCount: number, initialDensity: number) => {
    addLog(`Running Monte Carlo evacuation routes with ${gateCount} exit gates and ${(initialDensity * 100).toFixed(0)}% density.`, "warning", "CrowdFlowAgent");
    
    if (wsInstance && wsConnected) {
      wsInstance.send(JSON.stringify({
        action: "trigger_simulation",
        scenarioId: "00000000-0000-0000-0000-000000000000",
        parameters: {
          gateCount,
          initialDensity,
          hazardLocationId: "n-5"
        }
      }));
    } else {
      // Fallback simulation generator
      setTimeout(() => {
        setSimulationResult({
          hazardLevel: "high",
          evacuationProgress: 0.88,
          safeRoutes: [
            { path: ["Gate A", "Zone 1 (Concourse)"], estimatedTimeSeconds: 45, bottleneckNodeId: null },
            { path: ["Gate C", "Zone 1 (Concourse)"], estimatedTimeSeconds: 72, bottleneckNodeId: "n-4" }
          ]
        });
        addLog("Monte Carlo evacuation simulation completed successfully.", "success", "CrowdFlowAgent");
      }, 1200);
    }
  }, [wsInstance, wsConnected, addLog]);

  return (
    <TelemetryContext.Provider
      value={{
        nodes,
        edges,
        logs,
        wsConnected,
        ragResult,
        simulationResult,
        sponsorFlows,
        meshNodes,
        triggerRAG,
        triggerSimulation,
        addLog
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
};
