/**
 * @file page.tsx
 * @description Next.js page wrapper for the stadium Crisis sub-system view.
 */

"use client";

import { CrisisSimulator } from "../../../components/CrisisSimulator";
import { useTelemetry } from "../../../context/TelemetryContext";

export default function CrisisPage() {
  const { triggerSimulation, simulationResult } = useTelemetry();

  return (
    <CrisisSimulator
      onTriggerSimulation={triggerSimulation}
      simulationResult={simulationResult}
    />
  );
}
