"use client";

import { DynamicMonetization } from "../../components/DynamicMonetization";
import { useTelemetry } from "../../context/TelemetryContext";

export default function MonetizationPage() {
  const { sponsorFlows } = useTelemetry();

  return <DynamicMonetization sponsorFlows={sponsorFlows} />;
}
