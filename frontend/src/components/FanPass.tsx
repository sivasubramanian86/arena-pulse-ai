"use client";

/**
 * @file FanPass.tsx
 * @description FanPass interface simulating AR seat routing, ticket details, and deep link navigation for fans.
 */

import React from "react";
import { Ticket, MapPin, Compass, ShieldAlert } from "lucide-react";

export const FanPass: React.FC = React.memo(() => {
  // Deep link configuration according to privacy guidelines
  const transitDestination = encodeURIComponent("MetLife Stadium, East Rutherford, NJ");
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${transitDestination}`;
  const localMarketsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("transit stations near MetLife Stadium")}`;

  return (
    <div className="flex flex-col items-center justify-center p-4" role="region" aria-label="FanPass AR Wayfinder and Ticket">
      <div className="w-full max-w-sm bg-zinc-950 rounded-[40px] border-[10px] border-zinc-800 p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6 aspect-[9/19]">
        {/* Notch / Speaker header */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-800 rounded-full" aria-hidden="true" />

        {/* Status bar */}
        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mt-2 px-2 select-none">
          <span>09:41 AM</span>
          <span className="text-emerald-500 font-bold">5G • LIVE</span>
        </div>

        {/* App Title */}
        <div className="text-center">
          <h2 className="text-lg font-extrabold text-white tracking-wide">ArenaPulse FanPass</h2>
          <p className="text-xs text-zinc-500 mt-0.5">FIFA World Cup 2026</p>
        </div>

        {/* Smart Ticket */}
        <div className="bg-gradient-to-br from-indigo-900 to-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 relative">
          {/* Half circles decoration */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-950 border-r border-zinc-800 rounded-full" aria-hidden="true" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-950 border-l border-zinc-800 rounded-full" aria-hidden="true" />

          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
            <span className="text-[10px] font-bold text-indigo-400 tracking-wider">MATCH 15 • ROUND OF 16</span>
            <Ticket className="w-4 h-4 text-indigo-400" aria-hidden="true" />
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <span className="block text-2xl font-black text-white">USA</span>
              <span className="text-[10px] text-zinc-400 font-medium">HOST NATION</span>
            </div>
            <span className="text-sm font-bold text-zinc-500">VS</span>
            <div className="text-right">
              <span className="block text-2xl font-black text-white">ENG</span>
              <span className="text-[10px] text-zinc-400 font-medium">GROUP B WINNER</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono border-t border-zinc-800/80 pt-3">
            <div>
              <span className="block text-[8px] text-zinc-500">SEC</span>
              <span className="font-bold text-white">114A</span>
            </div>
            <div>
              <span className="block text-[8px] text-zinc-500">ROW</span>
              <span className="font-bold text-white">12</span>
            </div>
            <div>
              <span className="block text-[8px] text-zinc-500">SEAT</span>
              <span className="font-bold text-white">104</span>
            </div>
          </div>
        </div>

        {/* Simulated AR Viewport */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
          {/* Mock Camera Stream (Gradient/Grid) */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/50 to-zinc-950 opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:16px_16px] opacity-15" />

          {/* AR Pointer HUD */}
          <div className="relative z-10 flex flex-col items-center gap-2 text-center p-3 animate-pulse">
            <Compass className="w-10 h-10 text-emerald-500 stroke-[1.5]" />
            <div>
              <span className="block text-xs font-black text-white tracking-wide uppercase">Gate C Entrance</span>
              <span className="text-[10px] text-zinc-400">120m • Straight Ahead</span>
            </div>
          </div>

          {/* Dynamic Safe Pathway Indicator */}
          <div className="absolute bottom-2 left-3 right-3 z-10 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[9px] font-bold text-emerald-400 tracking-wide uppercase">Clear Path Confirmed</span>
          </div>
        </div>

        {/* Navigation & Transit Anchors */}
        <div className="flex flex-col gap-2.5">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-98"
            aria-label="Get directions to MetLife Stadium on Google Maps"
          >
            <MapPin className="w-4 h-4" />
            Navigate to Stadium
          </a>

          <a
            href={localMarketsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-98"
            aria-label="Find local transit stations on Google Maps"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Transit & Shuttle Hubs
          </a>
        </div>
      </div>
    </div>
  );
});

FanPass.displayName = "FanPass";
