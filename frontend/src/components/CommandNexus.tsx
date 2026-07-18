"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search, Network, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { NexusNode, NexusEdge } from "../types";
import { WowFeatures } from "./WowFeatures";

// Input validation schema using Zod
const QuerySchema = z.object({
  queryText: z.string().min(2, "Query must be at least 2 characters long"),
});

interface CommandNexusProps {
  nodes: NexusNode[];
  edges: NexusEdge[];
  onTriggerRAG: (query: string) => void;
  ragResult: {
    answer: string;
    sources: string[];
    confidence: number;
    thinkingSteps: string[];
  } | null;
}

export const CommandNexus: React.FC<CommandNexusProps> = React.memo(({
  nodes,
  edges,
  onTriggerRAG,
  ragResult,
}) => {
  const [queryInput, setQueryInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NexusNode | null>(null);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryInput(e.target.value);
    if (validationError) setValidationError(null);
  }, [validationError]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const result = QuerySchema.safeParse({ queryText: queryInput });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }
    setValidationError(null);
    onTriggerRAG(queryInput);
  }, [queryInput, onTriggerRAG]);

  // Compute status metrics to avoid recalculations on every render
  const stats = useMemo(() => {
    const total = nodes.length;
    const congested = nodes.filter(n => n.status === "congested" || n.status === "critical").length;
    const offline = nodes.filter(n => n.status === "offline").length;
    return { total, congested, offline };
  }, [nodes]);

  return (
    <div className="flex flex-col gap-6">
      <WowFeatures />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="region" aria-label="Command Nexus: Graph RAG Visualizer">
      {/* Control & Query Panel */}
      <div className="lg:col-span-1 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="text-blue-500 w-5 h-5" aria-hidden="true" />
            Agentic Graph RAG
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Query stadium topological knowledge, volunteer dispatch mappings, and emergency protocols.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="rag-query" className="text-sm font-semibold text-zinc-300">
            Topological Semantic Query
          </label>
          <div className="relative">
            <input
              id="rag-query"
              type="text"
              value={queryInput}
              onChange={handleQueryChange}
              placeholder="e.g. Reroute volunteers to congestion at Gate B"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              aria-describedby={validationError ? "query-error" : undefined}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1 text-xs font-semibold transition-colors active:scale-95"
              aria-label="Submit search query to Graph RAG orchestrator"
            >
              Query
            </button>
          </div>
          {validationError && (
            <p id="query-error" className="text-rose-500 text-xs flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {validationError}
            </p>
          )}
        </form>

        {/* Query Response Output */}
        <div className="flex-1 flex flex-col gap-4 border-t border-zinc-800 pt-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Retrieval Engine Output</h3>
          {ragResult ? (
            <div className="flex flex-col gap-4 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Confidence: {(ragResult.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-zinc-500 text-xs">Sources: {ragResult.sources.length}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-400">Answer</h4>
                <p className="text-sm text-zinc-100 mt-1 leading-relaxed">{ragResult.answer}</p>
              </div>
              {ragResult.thinkingSteps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-400">Agent Reasoning Sequence</h4>
                  <ul className="text-xs text-zinc-500 mt-1 list-disc list-inside space-y-1">
                    {ragResult.thinkingSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-zinc-500 text-sm">
                Submit a query to stream RAG node assertions and vector index matches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Network Topology Graph View */}
      <div className="lg:col-span-2 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="text-emerald-500 w-5 h-5" aria-hidden="true" />
              Live Stadium Node Network
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Topological nodes are color coded by crowd congestion ratios. Hover for metric details.
            </p>
          </div>
          {/* Legend Stats */}
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-zinc-400">Nodes: <b className="text-white">{stats.total}</b></span>
            <span className="text-amber-400">Congested: <b>{stats.congested}</b></span>
            <span className="text-rose-500">Offline: <b>{stats.offline}</b></span>
          </div>
        </div>

        {/* Live SVG Graph representation */}
        <div className="relative flex-1 bg-zinc-950 rounded-xl border border-zinc-800 min-h-[400px] flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400" aria-label="Interactive Stadium Map Topology">
            {/* Draw edge lines */}
            {edges.map((edge, idx) => {
              const srcNode = nodes.find(n => n.id === edge.source);
              const tgtNode = nodes.find(n => n.id === edge.target);
              if (!srcNode || !tgtNode) return null;
              
              // Simple layout coords mapper for 600x400 area
              const getCoords = (nodeName: string) => {
                switch(nodeName) {
                  case "Gate A": return { x: 100, y: 100 };
                  case "Gate B": return { x: 500, y: 100 };
                  case "Gate C": return { x: 300, y: 320 };
                  case "Zone 1 (Concourse)": return { x: 200, y: 200 };
                  case "Zone 2 (Tribunes)": return { x: 400, y: 200 };
                  case "Transit Hub Alpha": return { x: 300, y: 80 };
                  case "NOC Mainframe": return { x: 100, y: 300 };
                  default: return { x: 300, y: 200 };
                }
              };
              
              const p1 = getCoords(srcNode.name);
              const p2 = getCoords(tgtNode.name);

              return (
                <line
                  key={idx}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={edge.utilization > 0.8 ? "#f59e0b" : "#27272a"}
                  strokeWidth={edge.utilization > 0.8 ? 2 : 1}
                  strokeDasharray={edge.utilization > 0.8 ? "4 2" : "none"}
                />
              );
            })}

            {/* Draw nodes */}
            {nodes.map((node) => {
              const getCoords = (nodeName: string) => {
                switch(nodeName) {
                  case "Gate A": return { x: 100, y: 100 };
                  case "Gate B": return { x: 500, y: 100 };
                  case "Gate C": return { x: 300, y: 320 };
                  case "Zone 1 (Concourse)": return { x: 200, y: 200 };
                  case "Zone 2 (Tribunes)": return { x: 400, y: 200 };
                  case "Transit Hub Alpha": return { x: 300, y: 80 };
                  case "NOC Mainframe": return { x: 100, y: 300 };
                  default: return { x: 300, y: 200 };
                }
              };
              const { x, y } = getCoords(node.name);
              const color =
                node.status === "optimal" ? "#10b981" :
                node.status === "congested" ? "#f59e0b" :
                node.status === "critical" ? "#ef4444" : "#71717a";

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  role="button"
                  aria-label={`Node: ${node.name}, Status: ${node.status}, Density: ${(node.density * 100).toFixed(0)}%`}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill="#18181b"
                    stroke={color}
                    strokeWidth={3}
                  />
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize={10}
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Node detail tooltip */}
          {hoveredNode && (
            <div
              className="absolute bottom-4 left-4 bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-xs flex flex-col gap-1 w-48 shadow-2xl animate-fade-in"
              role="tooltip"
            >
              <span className="font-bold text-white">{hoveredNode.name}</span>
              <span className="text-zinc-400 capitalize">Type: {hoveredNode.type.replace("_", " ")}</span>
              <div className="flex justify-between items-center mt-1">
                <span className="text-zinc-500 font-medium">Density:</span>
                <span className="font-bold text-zinc-200">{(hoveredNode.density * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Status:</span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      hoveredNode.status === "optimal" ? "#10b981" :
                      hoveredNode.status === "congested" ? "#f59e0b" :
                      hoveredNode.status === "critical" ? "#ef4444" : "#71717a"
                  }}
                >
                  {hoveredNode.status.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
});

CommandNexus.displayName = "CommandNexus";
