"use client";

/**
 * @file CrisisSimulator.tsx
 * @description Operational simulation interface modeling stadium emergency scenarios and computing optimal egress routes.
 */

import React, { useState, useCallback } from "react";
import { ShieldAlert, Play, AlertCircle, Compass, HelpCircle } from "lucide-react";
import { z } from "zod";

import { CrisisAlertPayload } from "../types";

// Zod validation for simulation inputs
const SimulationParamSchema = z.object({
  gateCount: z.number().int().min(1, "Must configure at least 1 open exit gate").max(10, "Cannot configure more than 10 exit gates"),
  initialDensity: z.number().min(0.1, "Initial crowd density must be at least 10%").max(1.0, "Density cannot exceed 100%"),
});

/**
 * Props definition for the CrisisSimulator component.
 */
interface CrisisSimulatorProps {
  onTriggerSimulation: (gateCount: number, initialDensity: number) => void;
  simulationResult: CrisisAlertPayload | null;
}

/**
 * CrisisSimulator Component.
 * Enables live simulation parameters injection and displays routing vectors for crowd safety orchestration.
 */
export const CrisisSimulator: React.FC<CrisisSimulatorProps> = React.memo(({
  onTriggerSimulation,
  simulationResult,
}) => {
  const [gateCount, setGateCount] = useState(4);
  const [initialDensity, setInitialDensity] = useState(0.7);
  const [errors, setErrors] = useState<{ gateCount?: string; initialDensity?: string }>({});

  const handleRunSimulation = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const result = SimulationParamSchema.safeParse({ gateCount, initialDensity });
    if (!result.success) {
      const fieldErrors: { gateCount?: string; initialDensity?: string } = {};
      result.error.issues.forEach(err => {
        if (err.path[0] === "gateCount") fieldErrors.gateCount = err.message;
        if (err.path[0] === "initialDensity") fieldErrors.initialDensity = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onTriggerSimulation(gateCount, initialDensity);
  }, [gateCount, initialDensity, onTriggerSimulation]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="region" aria-label="Crisis Simulator: Evacuation Router">
      {/* Parameter Control Panel */}
      <div className="lg:col-span-1 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-rose-500 w-5 h-5" aria-hidden="true" />
            Evacuation Simulator
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Configure gates and initial densities to compute evacuation bottlenecks and optimal safety routing.
          </p>
        </div>

        <form onSubmit={handleRunSimulation} className="flex flex-col gap-5">
          {/* Gate Count Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gateCount" className="text-xs font-bold text-zinc-300">
              Open Exit Gates (1-10)
            </label>
            <input
              id="gateCount"
              type="number"
              value={gateCount}
              onChange={(e) => setGateCount(parseInt(e.target.value, 10) || 0)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 w-full font-mono"
            />
            {errors.gateCount && (
              <p className="text-rose-500 text-xs flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.gateCount}
              </p>
            )}
          </div>

          {/* Density Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="initialDensity" className="text-xs font-bold text-zinc-300">
              Initial Zone Density (10% - 100%)
            </label>
            <input
              id="initialDensity"
              type="number"
              step="0.05"
              value={initialDensity}
              onChange={(e) => setInitialDensity(parseFloat(e.target.value) || 0)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 w-full font-mono"
            />
            {errors.initialDensity && (
              <p className="text-rose-500 text-xs flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.initialDensity}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
            aria-label="Run Monte Carlo evacuation simulation"
          >
            <Play className="w-4 h-4" />
            Run Simulation
          </button>
        </form>
      </div>

      {/* Simulator Outputs Visualization */}
      <div className="lg:col-span-2 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="text-blue-500 w-5 h-5" aria-hidden="true" />
            Evacuation Analysis & Safe Corridors
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Simulated egress timelines and route clearances derived from graph model iterations.
          </p>
        </div>

        {simulationResult ? (
          <div className="flex flex-col gap-6">
            {/* Evacuation Progress bar */}
            <div className="flex flex-col gap-1.5 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-zinc-400">EVACUATION DEGREE</span>
                <span className="text-emerald-400">{(simulationResult.evacuationProgress * 100).toFixed(0)}% CLEAR</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800/80 mt-1">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${simulationResult.evacuationProgress * 100}%` }}
                />
              </div>
            </div>

            {/* Simulated Safe Routes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Optimized Safety Corridors</h3>
              {simulationResult.safeRoutes.map((route, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-sm font-bold text-zinc-200">Safety Pathway Corridor {idx + 1}</span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Nodes: {route.path.join(" ➔ ")}
                    </span>
                  </div>
                  <div className="flex flex-col text-right font-mono">
                    <span className="text-xs text-zinc-400">EST. EGRESS TIME</span>
                    <span className="text-base font-black text-rose-400">{route.estimatedTimeSeconds} SEC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-zinc-700 stroke-[1.5] mb-2" />
            <p className="text-zinc-500 text-sm">
              Standby. Configure parameters and run simulation to compute egress paths.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

CrisisSimulator.displayName = "CrisisSimulator";
