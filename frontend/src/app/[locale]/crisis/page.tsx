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
