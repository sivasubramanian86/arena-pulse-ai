"use client";

import { CommandNexus } from "../../components/CommandNexus";
import { useTelemetry } from "../../context/TelemetryContext";

export default function NexusPage() {
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
