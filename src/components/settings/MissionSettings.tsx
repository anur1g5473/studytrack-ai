"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Target, Save, Loader2, Calendar } from "lucide-react";
import { useStore } from "@/store/useStore";

const GOALS = ["NEET", "JEE", "College", "Skill-Learning", "Professional Exam", "Other"];

export function MissionSettings() {
  const { user, setUser } = useStore();
  const [goal, setGoal] = useState(user?.mission_goal || "Other");
  const [examDate, setExamDate] = useState(user?.exam_date || "");
  const [hours, setHours] = useState(user?.daily_study_hours || 4);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission_goal: goal,
          exam_date: examDate || null,
          daily_study_hours: hours,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        setMessage("Mission parameters updated!");
      } else {
        throw new Error(data.error || "Failed to update settings.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-red-400" />
        Mission Parameters
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Goal Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Primary Objective
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                  goal === g
                    ? "bg-red-500/20 border-red-500 text-red-300"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Date */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Deadline / Exam Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Study Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Daily Focus Target: <span className="text-white font-bold">{hours} hours</span>
          </label>
          <input
            type="range"
            min="1"
            max="12"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Light (1h)</span>
            <span>Intense (12h)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className={`text-sm ${message.includes("Failed") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </p>
          <Button type="submit" disabled={loading} variant="secondary" className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Parameters
          </Button>
        </div>
      </form>
    </div>
  );
}