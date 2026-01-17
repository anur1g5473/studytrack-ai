"use client";

import type { DayPlan } from "@/types/planner.types";
import { TaskCard } from "./TaskCard";
import { Clock } from "lucide-react";

type DayColumnProps = {
  day: DayPlan;
  onToggleTask: (taskId: string, status: boolean) => void;
  isToday: boolean;
};

export function DayColumn({ day, onToggleTask, isToday }: DayColumnProps) {
  const formattedDate = new Date(day.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Calculate total hours
  const totalHours = Math.round((day.totalMinutes / 60) * 10) / 10;

  return (
    <div className={`flex flex-col h-full min-w-[280px] md:min-w-[200px] snap-center rounded-xl border ${
      isToday ? "bg-indigo-900/10 border-indigo-500/30" : "bg-gray-900/30 border-gray-800"
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${isToday ? "border-indigo-500/30" : "border-gray-800"}`}>
        <div className="flex justify-between items-center mb-1">
          <h3 className={`font-bold text-lg ${isToday ? "text-indigo-400" : "text-white"}`}>
            {day.dayName}
          </h3>
          {isToday && (
            <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded text-white font-medium">
              Today
            </span>
          )}
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{formattedDate}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalHours}h
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {day.tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center p-4">
            <p className="text-sm">No tasks scheduled</p>
            <p className="text-xs mt-1">Enjoy your free time!</p>
          </div>
        ) : (
          day.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={onToggleTask} />
          ))
        )}
      </div>
    </div>
  );
}