"use client";

import React, { useMemo } from "react";
import { Zap, Cpu, Users, GitMerge, TrendingUp } from "lucide-react";

interface WowFeatureItem {
  metric: string;
  value: string | number;
  unit: string;
  description: string;
  trend: "up" | "down" | "stable";
  colorClass: string;
  bgGlowClass: string;
}

export const WowFeatures: React.FC = React.memo(() => {
  const features = useMemo<WowFeatureItem[]>(() => [
    {
      metric: "Bandwidth Conserved",
      value: "82.4",
      unit: "% Uplink Saved",
      description: "Local Edge Swarm camera/turnstile SLM triage suppresses nominal telemetry logs at the gate.",
      trend: "up",
      colorClass: "text-blue-400 border-blue-500/20 bg-blue-500/10",
      bgGlowClass: "from-blue-500/10 to-transparent",
    },
    {
      metric: "Consensus Loop Success",
      value: "100",
      unit: "% Auto-Negotiated",
      description: "Multi-agent autonomous consensus resolved conflicting crowd safety and transit speed objectives.",
      trend: "up",
      colorClass: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      bgGlowClass: "from-emerald-500/10 to-transparent",
    },
    {
      metric: "Fan Egress Throughput",
      value: "4,250",
      unit: "Fans / Min",
      description: "Real-time RAG routing guides fans through optimal gates, preventing crowd surges.",
      trend: "up",
      colorClass: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
      bgGlowClass: "from-indigo-500/10 to-transparent",
    },
    {
      metric: "NOC CPU Efficiency",
      value: "94.1",
      unit: "% Load Reduced",
      description: "Hierarchical supervisor-worker task decomposition limits unnecessary central processing.",
      trend: "up",
      colorClass: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      bgGlowClass: "from-amber-500/10 to-transparent",
    },
  ], []);

  return (
    <div
      className="p-6 md:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden flex flex-col gap-6"
      role="region"
      aria-label="FIFA Smart Stadium AI Operational Impact metrics"
    >
      {/* Background Glow Accent */}
      <div
        className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none bg-gradient-to-tr from-blue-500 via-emerald-500 to-transparent blur-[80px]"
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide">
              FIFA Smart Stadium Operational Impact
            </h2>
            <p className="text-xs text-zinc-400">
              Autonomous telemetry indicators mapped via Graph RAG and Edge Swarm.
            </p>
          </div>
        </div>

        {/* Powered by tag */}
        <div className="flex items-center gap-2 self-start sm:self-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Powered by Gemini 2.5 + ADK
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const Icon =
            idx === 0 ? Cpu :
            idx === 1 ? GitMerge :
            idx === 2 ? Users : Zap;

          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/80 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 group relative overflow-hidden flex flex-col justify-between min-h-[190px]"
            >
              {/* Internal card gradient glow */}
              <div className={`absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-br ${feature.bgGlowClass} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} aria-hidden="true" />

              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg border flex items-center justify-center text-sm transition-transform group-hover:scale-110 group-hover:rotate-3 ${feature.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>UP</span>
                </div>
              </div>

              <div className="mt-4">
                <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  {feature.metric}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white tracking-tight tabular-nums">
                    {feature.value}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">{feature.unit}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-dashed border-zinc-800/80">
                <p className="text-[10px] text-zinc-400 leading-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

WowFeatures.displayName = "WowFeatures";
