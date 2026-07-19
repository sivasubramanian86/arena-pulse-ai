/**
 * @file page.tsx
 * @description Next.js page wrapper for the stadium Monetization sub-system view.
 */

"use client";

import { DynamicMonetization } from "../../../components/DynamicMonetization";
import { useTelemetry } from "../../../context/TelemetryContext";

export default function MonetizationPage() {
  const { sponsorFlows } = useTelemetry();

  return <DynamicMonetization sponsorFlows={sponsorFlows} />;
}
