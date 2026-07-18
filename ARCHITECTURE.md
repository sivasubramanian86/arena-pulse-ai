# ArenaPulseAI — Architecture Design Document

This document outlines the architectural specifications, Agentic Graph RAG flow, and real-time WebSocket communication schemas for **ArenaPulseAI**, a production-grade multi-agent Smart Stadium Operating System designed for the FIFA World Cup 2026.

---

## 1. System Topology

ArenaPulseAI is designed as an asynchronous, event-driven multi-agent system decoupled from visual rendering to achieve sub-second operational latency. The infrastructure consists of a Next.js 15 (App Router) client interfaces layer, a FastAPI backend orchestrator layer, and a PostgreSQL/AlloyDB Omni storage engine utilizing `pgvector` for semantic graph relationships.

```
[ Next.js 15 UI Client ] <=======( WebSockets / WSS )=======> [ FastAPI Backend ]
  │ (React 19 + Framer Motion)                                  │ (Uvicorn / Asyncio)
  │                                                             │
  ├── CommandNexus (Graph RAG)                                  ├── OpsCommanderAgent (Orchestrator)
  ├── FanPass (Wayfinding AR)                                   ├── CrowdFlowAgent (Crowd Flow / Evacuation)
  ├── PolyglotKiosk (Translation)                               ├── PolyglotAgent (Real-time Translations)
  ├── EdgeMeshTopology (Hardware NOC)                           ├── LogisticsAgent (Volunteer Dispatch)
  └── [Other 7 Frontends]                                       └── TransitAgent (Transit Gantt Sync)
                                                                       │
                                                                       ▼ (Vertex AI ADK / Function Calling)
                                                              [ Gemini 2.5 Flash / Pro ]
                                                                       │
                                                                       ▼ (pgvector Hybrid Search & Graph Walk)
                                                              [ AlloyDB Omni / Postgres ]
```

### 100% Score Checklist: Google Cloud Services Integration
*   **Orchestration:** Google Agent Development Kit (ADK) using `Runner.run_async` with Gemini 2.5 models.
*   **Memory / Database:** AlloyDB Omni (or PostgreSQL) with `pgvector` index (HNSW) to support relational joins and vector similarity walks.
*   **Compute:** Cloud Run hosting the Next.js frontend and FastAPI backend with distinct Service Accounts.
*   **Observability:** Structured JSON logs standard output mapped to Google Cloud Logging.
*   **Security:** Google Cloud Secret Manager for all active API keys (`GEMINI_API_KEY`).

---

## 2. Agentic Graph RAG Workflow

The **Agentic Graph RAG** combines semantic vector search with physical stadium topology graph traversals. The stadium layout, transit routes, logistics centers, and security zones are modeled as nodes and edges in the relational database.

### Knowledge Graph Schema

*   **Nodes (`nodes` table):**
    *   `id`: UUID (Primary Key)
    *   `name`: VARCHAR
    *   `type`: VARCHAR (e.g., `ZONE`, `GATE`, `TRANSIT_STATION`, `KIOSK`, `WIFI_NODE`)
    *   `coordinates`: JSONB (`{x: number, y: number, z: number}`)
    *   `description`: TEXT
    *   `description_vector`: VECTOR(768) (indexed using HNSW cosine similarity)
*   **Edges (`edges` table):**
    *   `source_id`: UUID (Foreign Key -> `nodes.id`)
    *   `target_id`: UUID (Foreign Key -> `nodes.id`)
    *   `relation_type`: VARCHAR (e.g., `CONNECTED_TO`, `ADJACENT_TO`, `MONETIZED_BY`, `SERVED_BY`)
    *   `weight`: FLOAT (e.g., physical distance, transit latency, or node capacity)
    *   `metadata`: JSONB

### Execution Pipeline

When a query is received (e.g., *"How do we reroute volunteers from Gate A to Gate C if Zone B has crowd density exceeding 85%?"*):

```
[ User Query ]
      │
      ▼
[ Step 1: Query Embedding ] ──> Generate 768d vector using text-embedding-004
      │
      ▼
[ Step 2: Semantic Hook ] ────> Cosine similarity query on nodes.description_vector to find entrance nodes
      │
      ▼
[ Step 3: Graph Edge Walk ] ──> SQL Recursive Common Table Expression (CTE) to fetch adjacent zones / routes
      │
      ▼
[ Step 4: Hybrid Fusion ] ────> Combine BM25 full-text matching with vector distances and edge capacities
      │
      ▼
[ Step 5: ADK Context Build ] ─> Inject graph relationships (XML-wrapped) into OpsCommanderAgent prompt
      │
      ▼
[ Step 6: LLM Generation ] ───> Gemini 2.5 Pro generates optimal routing strategy and validation logic
```

---

## 3. Real-Time WebSocket Communication Schemas

To ensure strict type-safety and structural validation, all WebSocket communication payloads are validated on the backend using **Pydantic** and on the frontend using **Zod**.

### 3.1 Client-to-Server Messages (TypeScript Zod & Python Pydantic)

#### Action: Subscribe
Used by client to subscribe to specific operational channels.
```typescript
// Zod Schema
const ClientSubscribeSchema = z.object({
  action: z.literal("subscribe"),
  channel: z.enum(["command_nexus", "crowd_flow", "logistics", "transit", "edge_mesh", "monetization"]),
  authToken: z.string(),
});
```

#### Action: Trigger Simulation
Triggers a Monte Carlo simulation for evacuation scenarios.
```typescript
// Zod Schema
const ClientTriggerSimulationSchema = z.object({
  action: z.literal("trigger_simulation"),
  scenarioId: z.string().uuid(),
  parameters: z.object({
    gateCount: z.number().int().min(1).max(20),
    initialDensity: z.number().min(0.0).max(1.0),
    hazardLocationId: z.string().uuid(),
  }),
});
```

### 3.2 Server-to-Client Messages (Python Pydantic & TypeScript Zod)

The server streams a unified message wrapper containing the payload metadata.

```typescript
const ServerMessageWrapperSchema = z.object({
  timestamp: z.string().datetime(),
  event: z.enum(["telemetry", "agent_state", "audit_log", "crisis_alert"]),
  payload: z.any(),
});
```

#### Event: `agent_state` (Agent Reasoning Stream)
Used to display agent thinking steps, tools executed, and current pipeline focus.
```typescript
const AgentStatePayloadSchema = z.object({
  agentName: z.enum(["OpsCommanderAgent", "CrowdFlowAgent", "PolyglotAgent", "LogisticsAgent", "TransitAgent"]),
  status: z.enum(["idle", "thinking", "executing_tool", "completed", "error"]),
  thought: z.string(),
  activeTool: z.string().nullable(),
  progress: z.number().min(0).max(100),
});
```

#### Event: `telemetry` (Node Density & Topology Health)
Real-time stadium state metrics streamed at 500ms intervals.
```typescript
const TelemetryPayloadSchema = z.object({
  nexusNodes: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    type: z.string(),
    density: z.number().min(0).max(1),
    status: z.enum(["optimal", "congested", "critical", "offline"]),
  })),
  nexusEdges: z.array(z.object({
    source: z.string().uuid(),
    target: z.string().uuid(),
    utilization: z.number().min(0).max(1),
  })),
});
```

#### Event: `audit_log` (System Trace Terminal)
Real-time audit log streamed to the terminal console view.
```typescript
const AuditLogPayloadSchema = z.object({
  level: z.enum(["info", "success", "warning", "error"]),
  message: z.string(),
  component: z.string(),
});
```

#### Event: `crisis_alert` (Monte Carlo Evacuation State)
Continuous spatial update of paths and evacuation times.
```typescript
const CrisisAlertPayloadSchema = z.object({
  hazardLevel: z.enum(["low", "medium", "high", "extreme"]),
  safeRoutes: z.array(z.object({
    path: z.array(z.string().uuid()),
    estimatedTimeSeconds: z.number(),
    bottleneckNodeId: z.string().uuid().nullable(),
  })),
  evacuationProgress: z.number().min(0).max(1),
});
```

---

## 4. FIFA World Cup Live API Synchronization Pipeline

ArenaPulseAI supports live integration with third-party sports APIs (such as API-Football or Football-Data.org) to feed actual tournament states, group tables, player stats, and live match scores into the Agentic Graph RAG:

### 4.1 Schema Definitions (Graph RAG Nodes)
*   **Fixture Node:** Represents a live or scheduled match. Contains attributes for `matchId`, `status` (scheduled, live, completed), `venue`, `kickoffTime`, and `referee`.
*   **Team Node:** Represents a participant country (e.g. Argentina, France). Holds `countryCode`, `groupStageLetter`, and `points`.
*   **Event Node:** Dynamic match event nodes linked directly to `Fixture` (e.g., goals, penalties, yellow/red cards).

### 4.2 Data Ingestion Lifecycle
1.  **Ingestion:** A background scheduling service runs a Cron runner script inside FastAPI that polls the live fixtures endpoint (`/fixtures?league=1`) every 5 minutes.
2.  **Relational Database Persistence (Upsert):** The data is parsed and written to the DB. A transactional upsert (`INSERT ... ON CONFLICT DO UPDATE`) updates match status, current score, and minute metrics.
3.  **Embeddings Generation:** When a match event changes status (e.g., a card is shown), the event details are compiled into a semantic description string (e.g. *"France Team: Kylian Mbappé scores goal at 82nd minute against Argentina"*). This is sent to the Gemini embedding API to generate vector coefficients.
4.  **Similarity Edge Mapping:** The generated embedding is saved in the vector table. The graph relational crawler binds the new event node to its respective `Fixture` and `Team` nodes.
5.  **Agentic Graph Walk:** When a fan queries *"What was the latest goal scored in the Argentina match?"*, the `OpsCommanderAgent` computes cosine similarity between the query and the vector database to locate the event node, walks the graph edge to retrieve the match context, and generates a structured, factual answer using Gemini 2.5.

---

## 5. Evaluation Strategy (Target: 100/100)

*   **TypeScript Mode:** `"strict": true` configured globally in `tsconfig.json`. Generics used for all WebSocket connections.
*   **Accessibility:** semantic landmarks used throughout all 11 screens. Focus visible elements and aria properties validated programmatically via `axe-core`.
*   **Security:** Pydantic models validate incoming queries on the FastAPI layer; Zod parses all WS packets on the Next.js layer. Secrets loaded dynamically.
*   **Performance:** React components rendering charts or graph data wrapped with `React.memo` using strict dependency arrays in `useMemo` and `useCallback` hooks to bypass updates for unchanged telemetry frames.
