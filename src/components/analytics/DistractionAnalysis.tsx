"use client";

import { motion } from "framer-motion";
import type { DistractionStats } from "@/types/analytics.types";

type DistractionAnalysisProps = {
  distractions: DistractionStats[];
};

const distractionIcons: Record<string, string> = {
  phone: "📱",
  alert: "🔔",
  "mind-wandering": "💭",
  confusion: "❓",
  tiredness: "😴",
  other: "📌",
};

const distractionLabels: Record<string, string> = {
  phone: "Phone/Alert",
  alert: "Browser Alert",
  "mind-wandering": "Mind Wandering",
  confusion: "Confusion",
  tiredness: "Tiredness",
  other: "Other",
};

export function DistractionAnalysis({ distractions }: DistractionAnalysisProps) {
  const totalDistractions = distractions.reduce((sum, d) => sum + d.count, 0);

  if (totalDistractions === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center"
      >
        <div className="text-4xl mb-3">🎯</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Distractions Logged</h3>
        <p className="text-gray-400 text-sm">
          Amazing focus! Keep logging distractions during sessions to see patterns.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Distraction Patterns</h3>

      <div className="space-y-4">
        {distractions.map((distraction, idx) => (
          <motion.div
            key={distraction.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="space-y-2"
          >
            {/* Label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {distractionIcons[distraction.type] || "📌"}
                </span>
                <span className="text-sm font-medium text-gray-300">
                  {distractionLabels[distraction.type] || distraction.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{distraction.count}</span>
                <span className="text-xs text-gray-500">({distraction.percentage}%)</span>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div
              className="w-full bg-gray-800 rounded-full h-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${distraction.percentage}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Advice */}
      <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-300 font-medium mb-2">💡 Tip</p>
        <p className="text-xs text-yellow-200">
          Your most common distraction is{" "}
          <span className="font-bold">
            {distractionLabels[distractions[0]?.type] || distractions[0]?.type}
          </span>
          . Try to minimize this during your next focus session!
        </p>
      </div>
    </motion.div>
  );
}