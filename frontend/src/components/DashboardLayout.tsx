"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTelemetry } from "../context/TelemetryContext";
import {
  Network,
  Ticket,
  Languages,
  Settings,
  HelpCircle,
  FolderLock,
  Compass,
  Briefcase,
  Skull,
  TrendingUp,
  Activity,
  Terminal as TerminalIcon,
  Sun,
  Moon,
  CloudOff,
  CloudLightning
} from "lucide-react";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<string>("noc_director");
  const { wsConnected, logs } = useTelemetry();

  // Dark/Light Mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const tabs = useMemo(() => [
    { id: "nexus", path: "/nexus", label: "Command Nexus", icon: Network },
    { id: "fanpass", path: "/fanpass", label: "FanPass AR", icon: Ticket },
    { id: "polyglot", path: "/polyglot", label: "Polyglot Kiosk", icon: Languages },
    { id: "multimodal", path: "/multimodal", label: "MultiModal Hub", icon: FolderLock },
    { id: "transit", path: "/transit", label: "EcoTransit", icon: Compass },
    { id: "volunteer", path: "/volunteer", label: "Volunteer HUD", icon: Briefcase },
    { id: "crisis", path: "/crisis", label: "Evac Simulator", icon: Skull },
    { id: "monetization", path: "/monetization", label: "Monetization", icon: TrendingUp },
    { id: "mesh", path: "/mesh", label: "Edge Mesh", icon: Activity },
    { id: "preferences", path: "/preferences", label: "Settings", icon: Settings },
    { id: "faq", path: "/faq", label: "Vault FAQ", icon: HelpCircle }
  ], []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans mesh-bg" role="application">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-slate-900/40 px-6 py-4 backdrop-blur-2xl" role="banner">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20 text-blue-500">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              ARENAPULSE AI
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono font-semibold uppercase tracking-widest mt-0.5">
              Smart Stadium OS • FIFA World Cup 2026
            </p>
          </div>
        </div>

        {/* Global Controls & Beacons */}
        <div className="flex items-center gap-4">
          {/* Connection Status Beacon */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
              wsConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
            aria-live="polite"
          >
            {wsConnected ? (
              <>
                <CloudLightning className="w-3.5 h-3.5 animate-bounce" />
                TELEMETRY LIVE
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5" />
                DEGRADED (LOCAL MOCK)
              </>
            )}
          </div>

          {/* User Profile Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none pr-1 cursor-pointer"
            >
              <option value="noc_director" className="bg-zinc-950 text-white">NOC Director</option>
              <option value="field_supervisor" className="bg-zinc-950 text-white">Field Supervisor</option>
              <option value="volunteer" className="bg-zinc-950 text-white">Volunteer</option>
            </select>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl p-2.5 transition-colors active:scale-95 cursor-pointer"
            aria-label="Toggle Light/Dark operational layout"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 border-r border-white/10 bg-slate-900/30 p-4 backdrop-blur-2xl animate-fade-in" role="complementary">
          <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0" role="navigation" aria-label="System Interfaces Menu">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  aria-selected={isActive}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all flex-shrink-0 lg:flex-shrink-1 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Live FIFA Match Telemetry Sidebar Widget */}
          <div className="hidden lg:flex flex-col gap-4 mt-8 p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">FIFA Live Match Telemetry</span>
            
            {/* Attendance progress bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Stadium Attendance</span>
                <span className="text-emerald-400 font-bold">78,450 / 80,000</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 animate-pulse" style={{ width: "98%" }} />
              </div>
            </div>

            {/* WiFi Data Rate moving graph */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-500">WiFi Data Rate</span>
                <span className="text-blue-400 font-bold">12.4 Gbps</span>
              </div>
              <div className="flex gap-0.5 items-end h-7 bg-zinc-950/30 rounded border border-zinc-900/50 px-1 py-0.5" aria-hidden="true">
                <span className="flex-1 bg-blue-600/40 rounded-sm animate-pulse h-[40%]" />
                <span className="flex-1 bg-blue-600/60 rounded-sm animate-pulse [animation-delay:0.1s] h-[70%]" />
                <span className="flex-1 bg-blue-600/50 rounded-sm animate-pulse [animation-delay:0.2s] h-[55%]" />
                <span className="flex-1 bg-blue-600/80 rounded-sm animate-pulse [animation-delay:0.3s] h-[90%]" />
                <span className="flex-1 bg-blue-600/70 rounded-sm animate-pulse [animation-delay:0.4s] h-[75%]" />
                <span className="flex-1 bg-blue-600/90 rounded-sm animate-pulse [animation-delay:0.5s] h-[95%]" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content viewport area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto" role="main">
          {children}
        </main>
      </div>

      {/* Audit Log / System Terminal panel */}
      <footer className="border-t border-white/10 bg-slate-900/40 p-4 backdrop-blur-2xl" role="contentinfo">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <TerminalIcon className="w-4 h-4 text-zinc-500" />
            NOC Operational Audit Console
          </div>

          <div
            className="bg-slate-950/60 border border-white/10 rounded-xl p-3 h-28 overflow-y-auto font-mono text-[10px] leading-relaxed flex flex-col gap-1"
            role="log"
            aria-live="polite"
          >
            {logs.map((log, idx) => {
              const color =
                log.level === "success" ? "text-emerald-400" :
                log.level === "warning" ? "text-amber-500" :
                log.level === "error" ? "text-rose-500" : "text-zinc-400";
              return (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600">[{log.component}]</span>
                  <span className={color}>{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
};
