export interface NexusNode {
  id: string;
  name: string;
  type: "ZONE" | "GATE" | "TRANSIT_STATION" | "KIOSK" | "WIFI_NODE";
  density: number;
  status: "optimal" | "congested" | "critical" | "offline";
}

export interface NexusEdge {
  source: string;
  target: string;
  utilization: number;
}

export interface AgentStatePayload {
  agentName: "OpsCommanderAgent" | "CrowdFlowAgent" | "PolyglotAgent" | "LogisticsAgent" | "TransitAgent";
  status: "idle" | "thinking" | "executing_tool" | "completed" | "error";
  thought: string;
  activeTool: string | null;
  progress: number;
}

export interface AuditLogPayload {
  level: "info" | "success" | "warning" | "error";
  message: string;
  component: string;
}

export interface SafeRoute {
  path: string[];
  estimatedTimeSeconds: number;
  bottleneckNodeId?: string | null;
}

export interface CrisisAlertPayload {
  hazardLevel: "low" | "medium" | "high" | "extreme";
  safeRoutes: SafeRoute[];
  evacuationProgress: number;
}

export interface MonetizationFlowPayload {
  sponsorName: string;
  footfallCount: number;
  revenueGenerated: number;
  conversionRate: number;
}

export interface EdgeMeshNode {
  id: string;
  latencyMs: number;
  packetLoss: number;
  hardwareHealth: number;
  isOnline: boolean;
}

export interface TelemetryPayload {
  nexusNodes: NexusNode[];
  nexusEdges: NexusEdge[];
}
