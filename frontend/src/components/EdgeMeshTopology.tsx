"use client";

import React, { useMemo } from "react";
import { Cpu, Server, Activity, ShieldCheck } from "lucide-react";
import { EdgeMeshNode } from "../types";

interface EdgeMeshTopologyProps {
  meshNodes: EdgeMeshNode[];
}

export const EdgeMeshTopology: React.FC<EdgeMeshTopologyProps> = React.memo(({ meshNodes }) => {
  const meshStats = useMemo(() => {
    const total = meshNodes.length;
    const online = meshNodes.filter(n => n.isOnline).length;
    const avgLatency = meshNodes.length > 0
      ? meshNodes.reduce((acc, curr) => acc + curr.latencyMs, 0) / meshNodes.length
      : 0;
    return { total, online, avgLatency };
  }, [meshNodes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="region" aria-label="Edge Mesh Topology status">
      {/* Network Health Cards */}
      <div className="lg:col-span-1 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-blue-500 w-5 h-5" aria-hidden="true" />
            NOC Health Overview
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time status of physical NOC hardware nodes and edge routing topologies.
          </p>
        </div>

        <div className="flex flex-col gap-4 font-mono text-xs">
          {/* Online status */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mesh Status</span>
              <span className="block text-lg font-black text-white">
                {meshStats.online} / {meshStats.total} ONLINE
              </span>
            </div>
          </div>

          {/* Average Latency */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Average Latency</span>
              <span className="block text-lg font-black text-white">{meshStats.avgLatency.toFixed(1)} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edge Node Status Grid */}
      <div className="lg:col-span-2 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="text-emerald-500 w-5 h-5" aria-hidden="true" />
            Active Beacons & NOC Hardware Grid
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Decentralized beacons communicating status and packet metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meshNodes.map((node) => {
            const statusColor = node.isOnline
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-zinc-800 bg-zinc-950/40 text-zinc-500";

            return (
              <div
                key={node.id}
                className={`border p-4 rounded-xl flex flex-col gap-3 transition-colors ${statusColor}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-zinc-100">{node.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    node.isOnline ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  }`}>
                    {node.isOnline ? "online" : "offline"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-zinc-800/80 pt-3 text-zinc-400">
                  <div>
                    <span className="block text-[8px] text-zinc-500">LATENCY</span>
                    <span className="font-bold text-zinc-200">{node.latencyMs}ms</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500">PACKET LOSS</span>
                    <span className="font-bold text-zinc-200">{node.packetLoss.toFixed(2)}%</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="block text-[8px] text-zinc-500">HARDWARE HEALTH</span>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mt-0.5">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${node.hardwareHealth * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

EdgeMeshTopology.displayName = "EdgeMeshTopology";
