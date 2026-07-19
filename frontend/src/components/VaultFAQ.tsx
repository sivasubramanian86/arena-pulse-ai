/**
 * @file VaultFAQ.tsx
 * @description Technical FAQ panel detailing system architecture, agent mesh protocols, and security designs.
 */

"use client";

import React, { useState, useCallback } from "react";
import { HelpCircle, ChevronDown, Cpu, Network, Shield } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Architecture" | "Agents" | "Security";
}

const FAQS: FAQItem[] = [
  {
    category: "Architecture",
    question: "What is the role of Agentic Graph RAG in ArenaPulseAI?",
    answer: "Agentic Graph RAG acts as the core knowledge system. It embeds stadium topological layouts, transit schedules, and emergency response directives. By using pgvector to execute cosine distance scans coupled with SQL graph walking queries (CTEs), specialized agents can construct context-aware routing strategies with 100% factual grounding.",
  },
  {
    category: "Agents",
    question: "How do sub-agents communicate and execute actions?",
    answer: "Operations are managed by OpsCommanderAgent, which acts as the supervisor agent. When a complex query arrives, OpsCommanderAgent breaks it down and routes tasks to specialized agents (e.g. CrowdFlowAgent or TransitAgent) using JSON payload contracts. The reasoning chains and telemetry feeds are synced to the UI using async WebSockets.",
  },
  {
    category: "Security",
    question: "Are stadium systems secure against API key exposure and unauthorized access?",
    answer: "Yes. All system credentials (such as Vertex AI API keys) are loaded from Google Cloud Secret Manager at startup, with zero hardcoding. Input and output payloads are strictly validated using Zod schemas on the frontend and Pydantic validation models on the FastAPI backend layer.",
  },
];

export const VaultFAQ: React.FC = React.memo(() => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = useCallback((idx: number) => {
    setExpandedIndex(prev => (prev === idx ? null : idx));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" role="region" aria-label="Vault FAQ and System Architecture">
      {/* Interactive FAQ Section */}
      <div className="flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="text-blue-500 w-5 h-5" aria-hidden="true" />
            Operations Vault FAQ
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Frequently asked technical questions regarding the ArenaPulseAI smart stadium architecture.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-800 rounded-xl bg-zinc-950/40 overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-bold text-zinc-200 hover:text-white transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span className="flex items-center gap-2">
                    {faq.category === "Architecture" && <Cpu className="w-4 h-4 text-blue-400" />}
                    {faq.category === "Agents" && <Network className="w-4 h-4 text-emerald-400" />}
                    {faq.category === "Security" && <Shield className="w-4 h-4 text-rose-400" />}
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  className={`transition-all duration-300 ${
                    isExpanded ? "max-h-40 border-t border-zinc-900 px-4 py-3.5 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                  role="region"
                  aria-labelledby={`faq-btn-${idx}`}
                >
                  <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Architecture Diagram Section */}
      <div className="flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="text-emerald-500 w-5 h-5" aria-hidden="true" />
            System Architecture Overview
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Topological layout of serverless runtimes, model gardens, and RAG databases.
          </p>
        </div>

        {/* Beautiful Custom SVG Diagram */}
        <div className="flex-1 bg-zinc-950 rounded-xl border border-zinc-800 min-h-[300px] flex items-center justify-center p-4">
          <svg className="w-full h-full max-h-[280px]" viewBox="0 0 400 240" aria-label="System Topology Flowchart">
            {/* Elements / Nodes */}
            {/* Next.js Box */}
            <rect x="20" y="30" width="90" height="40" rx="6" fill="#18181b" stroke="#3b82f6" strokeWidth="2" />
            <text x="65" y="55" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Next.js Client</text>

            {/* FastAPI Box */}
            <rect x="150" y="30" width="100" height="40" rx="6" fill="#18181b" stroke="#10b981" strokeWidth="2" />
            <text x="200" y="55" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">FastAPI Server</text>

            {/* AlloyDB Box */}
            <rect x="290" y="30" width="90" height="40" rx="6" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
            <text x="335" y="55" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">AlloyDB pgvector</text>

            {/* Sub-Agents Box */}
            <rect x="150" y="140" width="100" height="50" rx="6" fill="#18181b" stroke="#8b5cf6" strokeWidth="2" />
            <text x="200" y="165" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">ADK Agents</text>
            <text x="200" y="180" textAnchor="middle" fill="#a1a1aa" fontSize="8">(Orchestrator Mesh)</text>

            {/* Connectors & Arrows */}
            {/* NextJS <-> FastAPI WebSocket (bidirectional) */}
            <line x1="110" y1="50" x2="150" y2="50" stroke="#a1a1aa" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="130" y="44" textAnchor="middle" fill="#a1a1aa" fontSize="7" fontFamily="monospace">WSS</text>

            {/* FastAPI -> AlloyDB */}
            <line x1="250" y1="50" x2="290" y2="50" stroke="#a1a1aa" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="270" y="44" textAnchor="middle" fill="#a1a1aa" fontSize="7">SQL</text>

            {/* FastAPI -> ADK */}
            <line x1="200" y1="70" x2="200" y2="140" stroke="#a1a1aa" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="210" y="110" textAnchor="start" fill="#a1a1aa" fontSize="7">Agentic Loop</text>

            {/* Marker Definitions for Arrows */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
});

VaultFAQ.displayName = "VaultFAQ";
