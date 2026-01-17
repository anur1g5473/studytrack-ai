"use client";

import type { ScheduleTask } from "@/types/planner.types";
import { CheckCircle, Circle, Clock } from "lucide-react";

type TaskCardProps = {
  task: ScheduleTask;
  onToggle: (taskId: string, status: boolean) => void;
};

export function TaskCard({ task, onToggle }: TaskCardProps) {
  const subjectColor = task.topic?.subject?.color || "#6366f1";

  return (
    <div 
      className={`p-3 rounded-lg border bg-gray-800/50 hover:bg-gray-800 transition-all group ${
        task.is_completed ? "opacity-60 border-transparent" : "border-gray-700"
      }`}
      style={{ borderLeftColor: subjectColor, borderLeftWidth: "4px" }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id, !task.is_completed)}
          className="mt-0.5 text-gray-500 hover:text-green-400 transition-colors"
        >
          {task.is_completed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${task.is_completed ? "text-gray-500 line-through" : "text-gray-200"}`}>
            {task.topic?.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">
              {task.topic?.subject?.name || "Subject"}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.topic?.estimated_minutes || 30}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}