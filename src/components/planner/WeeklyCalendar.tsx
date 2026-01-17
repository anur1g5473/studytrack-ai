"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import * as queries from "@/lib/supabase/planner-queries";
import { DayColumn } from "./DayColumn";
import { GeneratePlanDialog } from "./GeneratePlanDialog";
import { Button } from "@/components/ui/Button";
import { Calendar, ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import type { ScheduleTask, DayPlan } from "@/types/planner.types";

export function WeeklyCalendar() {
  const { user } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get start of week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const fetchWeekData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const tasks = await queries.fetchSchedule(
        user.id,
        startOfWeek.toISOString().split("T")[0],
        endOfWeek.toISOString().split("T")[0]
      );

      // Group by date
      const days: DayPlan[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        
        const dayTasks = tasks.filter((t) => t.scheduled_date === dateStr);
        const totalMinutes = dayTasks.reduce(
          (sum, t) => sum + (t.topic?.estimated_minutes || 30),
          0
        );

        days.push({
          date: dateStr,
          dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
          tasks: dayTasks,
          totalMinutes,
        });
      }
      setWeekPlan(days);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, [currentDate, user]);

  const handleToggleTask = async (taskId: string, status: boolean) => {
    // Optimistic update
    setWeekPlan((prev) =>
      prev.map((day) => ({
        ...day,
        tasks: day.tasks.map((t) =>
          t.id === taskId ? { ...t, is_completed: status } : t
        ),
      }))
    );

    await queries.toggleTaskCompletion(taskId, status);
  };

  const changeWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const weekLabel = `${startOfWeek.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${new Date(
    startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => changeWeek("prev")}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 font-medium text-white min-w-[140px] text-center">
              {weekLabel}
            </div>
            <button
              onClick={() => changeWeek("next")}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Today
          </button>
        </div>

        <Button onClick={() => setIsGenerateOpen(true)} className="gap-2">
          <Wand2 className="w-4 h-4" />
          Auto-Plan Week
        </Button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading schedule...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-[600px] min-w-max px-1">
            {weekPlan.map((day) => {
              const isToday =
                day.date === new Date().toISOString().split("T")[0];
              return (
                <DayColumn
                  key={day.date}
                  day={day}
                  onToggleTask={handleToggleTask}
                  isToday={isToday}
                />
              );
            })}
          </div>
        </div>
      )}

      <GeneratePlanDialog
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={fetchWeekData}
      />
    </div>
  );
}