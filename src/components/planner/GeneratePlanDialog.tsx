"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Calendar, Loader2 } from "lucide-react";
import { generateWeeklyPlan } from "@/lib/planner-algorithm";
import { useStore } from "@/store/useStore";

type GeneratePlanDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function GeneratePlanDialog({ isOpen, onClose, onSuccess }: GeneratePlanDialogProps) {
  const { user } = useStore();
  const [dailyHours, setDailyHours] = useState(user?.daily_study_hours || 4);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Start from next Monday or Today? Let's do Today
      const today = new Date();
      await generateWeeklyPlan(user.id, today, dailyHours);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Auto-Schedule Week
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            AI will analyze your unscheduled topics and distribute them optimally across this week based on difficulty and estimated time.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Daily Study Target: {dailyHours} hours
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Light (1h)</span>
              <span>Intense (12h)</span>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/30 p-3 rounded-lg">
            <p className="text-xs text-yellow-200">
              ⚠️ Warning: This will overwrite any uncompleted tasks in your current week's schedule.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Plan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}