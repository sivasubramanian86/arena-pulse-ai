"use client";

/**
 * @file VolunteerHUD.tsx
 * @description Operational dashboard for volunteer management and task dispatch to Wrist HUD units.
 */

import React, { useState, useCallback } from "react";
import { UserCheck, ShieldAlert, Award, Play, Check, Users, MessageSquare, Send, Bell, Star } from "lucide-react";

interface DispatchTask {
  id: string;
  title: string;
  location: string;
  priority: "high" | "medium" | "low";
  description: string;
}

interface VolunteerRoster {
  id: string;
  name: string;
  role: string;
  location: string;
  status: "active" | "dispatched" | "break";
}

const INITIAL_TASKS: DispatchTask[] = [
  {
    id: "task-1",
    title: "Congestion at Gate B",
    location: "Gate B Pedestrian Lane",
    priority: "high",
    description: "Guide arriving fans away from bottleneck Lane 4 towards under-utilized Lane 1 & 2.",
  },
  {
    id: "task-2",
    title: "Wheelchair Assist",
    location: "Transit Hub Alpha",
    priority: "medium",
    description: "Assist elderly fan with wheelchair transport to Section 112.",
  },
];

const INITIAL_ROSTER: VolunteerRoster[] = [
  { id: "v-1", name: "Carlos Gomez", role: "Access Coordinator", location: "Gate B", status: "dispatched" },
  { id: "v-2", name: "Amina Al-Sayed", role: "Language Assistant", location: "Gate A", status: "active" },
  { id: "v-3", name: "John Smith", role: "Crowd Marshall", location: "Zone 1", status: "active" },
  { id: "v-4", name: "Yuki Tanaka", role: "Medical Coordinator", location: "Zone 2", status: "break" }
];

export const VolunteerHUD: React.FC = React.memo(() => {
  const [tasks, setTasks] = useState<DispatchTask[]>(INITIAL_TASKS);
  const [activeTask, setActiveTask] = useState<DispatchTask | null>(null);
  const [roster, setRoster] = useState<VolunteerRoster[]>(INITIAL_ROSTER);
  
  // Custom Broadcast State
  const [alertText, setAlertText] = useState("");
  const [targetLocation, setTargetLocation] = useState("Gate A");
  const [alertPriority, setAlertPriority] = useState<"high" | "medium" | "low">("medium");

  const startTask = useCallback((task: DispatchTask) => {
    setActiveTask(task);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  }, []);

  const completeTask = useCallback(() => {
    setActiveTask(null);
  }, []);

  // Dispatch a new task from the Operations Dashboard to the Wrist HUD
  const handleDispatch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!alertText.trim()) return;

    const newTask: DispatchTask = {
      id: `task-${Date.now()}`,
      title: alertText.length > 22 ? alertText.substring(0, 22) + "..." : alertText,
      location: targetLocation,
      priority: alertPriority,
      description: alertText
    };

    setTasks(prev => [newTask, ...prev]);
    setAlertText("");

    // Set Carlos Gomez to dispatched if we dispatch a task near Gate B
    if (targetLocation.includes("Gate B")) {
      setRoster(prev => prev.map(v => v.id === "v-1" ? { ...v, status: "dispatched" } : v));
    }
  }, [alertText, targetLocation, alertPriority]);

  return (
    <div className="flex flex-col gap-8 w-full" role="region" aria-label="Volunteer Command & HUD Control Center">
      
      {/* Upper Statistics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-1 transition-colors duration-250">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Active Staff</span>
          <span className="text-2xl font-black text-zinc-900 dark:text-white">1,240</span>
          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">96.8% Turnout Rate</span>
        </div>
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-1 transition-colors duration-250">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Tasks Resolved</span>
          <span className="text-2xl font-black text-zinc-900 dark:text-white">342</span>
          <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">avg 4.2 mins / dispatch</span>
        </div>
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-1 transition-colors duration-250">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Language Coverage</span>
          <span className="text-2xl font-black text-zinc-900 dark:text-white">14</span>
          <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">Translators in all Sectors</span>
        </div>
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-1 transition-colors duration-250">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Evac Readiness</span>
          <span className="text-2xl font-black text-zinc-900 dark:text-white">100%</span>
          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Simulators Calibrated</span>
        </div>
      </div>

      {/* Main Core Layout: Wrist Watch on Left, Roster & dispatch on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column:Wrist HUD Device Simulator */}
        <div className="col-span-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl transition-colors duration-250 gap-4 min-h-[460px]">
          <div className="text-center">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-wider">Field Wrist HUD</h2>
            <p className="text-zinc-400 text-[10px] mt-0.5">
              Simulates real-time watch telemetry sent to stadium field volunteers.
            </p>
          </div>

          {/* Watch Frame */}
          <div className="w-[280px] h-[350px] bg-zinc-900 dark:bg-zinc-950 rounded-[48px] border-[10px] border-zinc-700 dark:border-zinc-800 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[3/4] transition-colors duration-250 select-none">
            
            {/* Watch Speaker Grill decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-800 rounded-full" aria-hidden="true" />
            
            {/* Wrist HUD Header */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 select-none mt-1">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-blue-500" />
                HUD v1.4
              </span>
              <span className="text-emerald-500 font-bold font-mono">ONLINE</span>
            </div>

            {/* HUD Core Display Area */}
            <div className="flex-1 my-3 flex flex-col justify-center overflow-y-auto pr-1">
              {activeTask ? (
                /* Active Task State */
                <div className="flex flex-col gap-2 text-center items-center animate-fade-in">
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 p-2 rounded-full w-9 h-9 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase leading-snug">{activeTask.title}</h3>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{activeTask.location}</span>
                  <p className="text-[9px] text-zinc-500 leading-normal max-w-[180px] text-center">
                    {activeTask.description}
                  </p>
                  <button
                    onClick={completeTask}
                    className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-2 transition-colors active:scale-90 flex items-center justify-center shadow-lg shadow-emerald-600/20"
                    aria-label="Mark current task as complete"
                  >
                    <Check className="w-4 h-4 font-bold" />
                  </button>
                </div>
              ) : tasks.length > 0 ? (
                /* Available Task List State */
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-center block">
                    Pending Dispatch
                  </span>
                  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[160px] pr-1">
                    {tasks.map((task) => {
                      const priorityColor =
                        task.priority === "high" ? "border-rose-500/30 bg-rose-500/5 text-rose-400" :
                        task.priority === "medium" ? "border-amber-500/30 bg-amber-500/5 text-amber-400" :
                        "border-blue-500/30 bg-blue-500/5 text-blue-400";
                      
                      return (
                        <div
                          key={task.id}
                          className={`border p-2 rounded-xl flex items-center justify-between gap-2 transition-all ${priorityColor}`}
                        >
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="text-[10px] font-black leading-tight block truncate max-w-[130px]">{task.title}</span>
                            <span className="text-[8px] font-medium text-zinc-400 font-mono truncate max-w-[120px]">{task.location}</span>
                          </div>
                          <button
                            onClick={() => startTask(task)}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg p-1 transition-colors active:scale-95 flex items-center justify-center"
                            aria-label={`Start task: ${task.title}`}
                          >
                            <Play className="w-3 h-3 text-emerald-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Idle / All Tasks Complete State */
                <div className="flex flex-col gap-2 text-center items-center animate-fade-in">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-full w-10 h-10 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">All Clear</h3>
                  <p className="text-[9px] text-zinc-500 max-w-[160px]">
                    No pending volunteer dispatch alerts currently. Stand by for telemetry routes.
                  </p>
                </div>
              )}
            </div>

            {/* Watch crown / bottom bezel indicator */}
            <div className="text-[8px] font-mono text-zinc-500 text-center select-none uppercase tracking-widest mb-1">
              B-SIDE CONTROLLER
            </div>
          </div>
        </div>

        {/* Right Column: Roster & Command Dashboard */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Roster List Card */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4 transition-colors duration-250">
              <div>
                <h3 className="text-md font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Operations Field Roster
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                  Track stadium volunteer positions and dispatch statuses.
                </p>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] pr-1">
                {roster.map((v) => {
                  const statusColors = 
                    v.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                    v.status === "dispatched" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                    "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
                  
                  return (
                    <div key={v.id} className="flex justify-between items-center p-3 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{v.name}</span>
                        <span className="text-[10px] text-zinc-500">{v.role} • {v.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold border rounded-full px-2 py-0.5 uppercase tracking-wider ${statusColors}`}>
                          {v.status}
                        </span>
                        <button
                          onClick={() => {
                            setTargetLocation(v.location);
                            setAlertText(`Emergency Alert: Assistance required at ${v.location}. Please deploy.`);
                            setAlertPriority("high");
                          }}
                          className="text-[10px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-lg font-bold transition-all"
                          aria-label={`Send direct alert to ${v.name}`}
                        >
                          Alert
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Broadcast / Dispatch Alert Center Card */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4 transition-colors duration-250">
              <div>
                <h3 className="text-md font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  Volunteer Dispatch Center
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                  Broadcast operational alerts directly to active field wrist HUD devices.
                </p>
              </div>

              <form onSubmit={handleDispatch} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="dispatch-alert" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                    Alert Message
                  </label>
                  <input
                    id="dispatch-alert"
                    type="text"
                    value={alertText}
                    onChange={(e) => setAlertText(e.target.value)}
                    placeholder="e.g. Crowd density surge near Exit Turnstiles..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="dispatch-location" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                      Target Sector
                    </label>
                    <select
                      id="dispatch-location"
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Gate A">Gate A</option>
                      <option value="Gate B">Gate B</option>
                      <option value="Gate C">Gate C</option>
                      <option value="Zone 1 (Concourse)">Zone 1</option>
                      <option value="Zone 2 (Tribunes)">Zone 2</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="dispatch-priority" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                      Priority Level
                    </label>
                    <select
                      id="dispatch-priority"
                      value={alertPriority}
                      onChange={(e) => setAlertPriority(e.target.value as "high" | "medium" | "low")}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!alertText.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-150 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch To HUD
                </button>
              </form>
            </div>
          </div>

          {/* Quick Tasks templates card */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col gap-3 transition-colors duration-250">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-left">
              Quick Operations Templates
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  setTargetLocation("Gate B");
                  setAlertText("Divert incoming fan arrivals away from Congested Gate B concourse.");
                  setAlertPriority("high");
                }}
                className="bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold transition-all text-left flex items-center gap-2 flex-shrink-0"
              >
                <Bell className="w-3.5 h-3.5 text-rose-500" />
                Gate B Diversion
              </button>
              <button
                onClick={() => {
                  setTargetLocation("Zone 1 (Concourse)");
                  setAlertText("Clean-up crew requested at Concourse Zone 1 Food Court.");
                  setAlertPriority("low");
                }}
                className="bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold transition-all text-left flex items-center gap-2 flex-shrink-0"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Zone 1 Clean-up
              </button>
              <button
                onClick={() => {
                  setTargetLocation("Gate C");
                  setAlertText("Gate C Turnstile validation error. Assistance required.");
                  setAlertPriority("medium");
                }}
                className="bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold transition-all text-left flex items-center gap-2 flex-shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                Turnstile Validation
              </button>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
});

VolunteerHUD.displayName = "VolunteerHUD";
