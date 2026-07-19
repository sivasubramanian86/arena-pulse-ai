/**
 * @file page.tsx
 * @description Next.js page wrapper for the stadium Nexus sub-system view.
 */

"use client";

import { CommandNexus } from "../../../components/CommandNexus";
import { useTelemetry } from "../../../context/TelemetryContext";

export default function CommandNexusPage() {
  const { nodes, edges, triggerRAG, ragResult } = useTelemetry();

  return (
    <CommandNexus
      nodes={nodes}
      edges={edges}
      onTriggerRAG={triggerRAG}
      ragResult={ragResult}
    />
  );
}
