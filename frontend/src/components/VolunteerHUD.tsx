"use client";

import React, { useState, useCallback } from "react";
import { UserCheck, ShieldAlert, Award, Play, Check } from "lucide-react";

interface DispatchTask {
  id: string;
  title: string;
  location: string;
  priority: "high" | "medium" | "low";
  description: string;
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

export const VolunteerHUD: React.FC = React.memo(() => {
  const [tasks, setTasks] = useState<DispatchTask[]>(INITIAL_TASKS);
  const [activeTask, setActiveTask] = useState<DispatchTask | null>(null);

  const startTask = useCallback((task: DispatchTask) => {
    setActiveTask(task);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  }, []);

  const completeTask = useCallback(() => {
    setActiveTask(null);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4" role="region" aria-label="Volunteer Wrist HUD Device Simulator">
      {/* Watch Frame */}
      <div className="w-[280px] h-[340px] bg-zinc-950 rounded-[48px] border-[12px] border-zinc-800 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[3/4]">
        
        {/* Watch Speaker Grill decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-800 rounded-full" aria-hidden="true" />
        
        {/* Wrist HUD Header */}
        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 select-none">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-blue-500" />
            HUD v1.4
          </span>
          <span className="text-emerald-500 font-bold">ONLINE</span>
        </div>

        {/* HUD Core Display Area */}
        <div className="flex-1 my-3 flex flex-col justify-center overflow-y-auto pr-1">
          {activeTask ? (
            /* Active Task State */
            <div className="flex flex-col gap-2 text-center items-center animate-fade-in">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2 rounded-full w-9 h-9 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-xs font-black text-white uppercase leading-snug">{activeTask.title}</h3>
              <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{activeTask.location}</span>
              <p className="text-[9px] text-zinc-500 leading-normal max-w-[180px] text-center">
                {activeTask.description}
              </p>
              <button
                onClick={completeTask}
                className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-2.5 transition-colors active:scale-90 flex items-center justify-center"
                aria-label="Mark current task as complete"
              >
                <Check className="w-4 h-4" />
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
                    "border-amber-500/30 bg-amber-500/5 text-amber-400";
                  
                  return (
                    <div
                      key={task.id}
                      className={`border p-2 rounded-xl flex items-center justify-between gap-2 ${priorityColor}`}
                    >
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] font-black leading-tight block truncate max-w-[130px]">{task.title}</span>
                        <span className="text-[8px] font-medium text-zinc-400 font-mono truncate max-w-[120px]">{task.location}</span>
                      </div>
                      <button
                        onClick={() => startTask(task)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg p-1.5 transition-colors active:scale-95 flex items-center justify-center"
                        aria-label={`Start task: ${task.title}`}
                      >
                        <Play className="w-3.5 h-3.5" />
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
        <div className="text-[8px] font-mono text-zinc-500 text-center select-none uppercase tracking-widest mt-1">
          B-SIDE CONTROLLER
        </div>
      </div>
    </div>
  );
});

VolunteerHUD.displayName = "VolunteerHUD";
