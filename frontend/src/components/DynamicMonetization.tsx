/**
 * @file DynamicMonetization.tsx
 * @description Revenue performance and dynamic monetization analytics dashboard displaying sponsor streams and metrics.
 */

"use client";

import React, { useMemo } from "react";
import { TrendingUp, Award, DollarSign, Users } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { MonetizationFlowPayload } from "../types";

interface DynamicMonetizationProps {
  sponsorFlows: MonetizationFlowPayload[];
}

export const DynamicMonetization: React.FC<DynamicMonetizationProps> = React.memo(({ sponsorFlows }) => {
  const stats = useMemo(() => {
    const totalFootfall = sponsorFlows.reduce((acc, curr) => acc + curr.footfallCount, 0);
    const totalRevenue = sponsorFlows.reduce((acc, curr) => acc + curr.revenueGenerated, 0);
    const avgConversion = sponsorFlows.length > 0
      ? sponsorFlows.reduce((acc, curr) => acc + curr.conversionRate, 0) / sponsorFlows.length
      : 0;
    return { totalFootfall, totalRevenue, avgConversion };
  }, [sponsorFlows]);

  // Mock data for trends area chart
  const trendData = [
    { name: "18:00", footfall: 400, revenue: 1200 },
    { name: "19:00", footfall: 1200, revenue: 3600 },
    { name: "20:00", footfall: 1800, revenue: 5400 },
    { name: "21:00", footfall: 2400, revenue: 7800 },
    { name: "22:00", footfall: 3100, revenue: 10200 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="region" aria-label="Sponsor Monetization & Footfall Stream">
      {/* Monetization Overview Cards */}
      <div className="lg:col-span-1 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-emerald-500 w-5 h-5" aria-hidden="true" />
            Monetization Summary
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time tracking of sponsor activations and footfall conversions.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Total Revenue */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Revenue Generated</span>
              <span className="block text-2xl font-black text-white">${stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Total Footfall */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Active Footfall</span>
              <span className="block text-2xl font-black text-white">{stats.totalFootfall.toLocaleString()}</span>
            </div>
          </div>

          {/* Average Conversion */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Conversion Ratio</span>
              <span className="block text-2xl font-black text-white">{(stats.avgConversion * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Flow List & Conversion Chart */}
      <div className="lg:col-span-2 flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500 w-5 h-5" aria-hidden="true" />
            Sponsor Performance Dashboard
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time breakdown of sponsor stand performance.
          </p>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-44 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", fontSize: 10 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sponsor list */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Sponsor Stand Feeds</h3>
          {sponsorFlows.map((sponsor, idx) => (
            <div
              key={idx}
              className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl flex justify-between items-center"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-white">{sponsor.sponsorName}</span>
                <span className="text-xs text-zinc-500">
                  Footfall: <b className="text-zinc-300">{sponsor.footfallCount}</b> | Conversion: <b className="text-zinc-300">{(sponsor.conversionRate * 100).toFixed(0)}%</b>
                </span>
              </div>
              <span className="text-sm font-black text-emerald-400 font-mono">+${sponsor.revenueGenerated.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

DynamicMonetization.displayName = "DynamicMonetization";
