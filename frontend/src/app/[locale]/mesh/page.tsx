"use client";

import { EdgeMeshTopology } from "../../../components/EdgeMeshTopology";
import { useTelemetry } from "../../../context/TelemetryContext";

export default function MeshPage() {
  const { meshNodes } = useTelemetry();

  return <EdgeMeshTopology meshNodes={meshNodes} />;
}
