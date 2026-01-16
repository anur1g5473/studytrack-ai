"use client";

import { motion } from "framer-motion";
import type { HourlyStats } from "@/types/analytics.types";

type FocusHeatmapProps = {
  hourlyStats: HourlyStats[];
};

export function FocusHeatmap({ hourlyStats }: FocusHeatmapProps) {
  const maxSessions = Math.max(...hourlyStats.map((h) => h.sessionsCount), 1);

  const getHeatmapColor = (sessions: number, maxSessions: number): string => {
    const intensity = sessions / maxSessions;
    if (intensity === 0) return "bg-gray-800";
    if (intensity < 0.2) return "bg-indigo-900";
    if (intensity < 0.4) return "bg-indigo-700";
    if (intensity < 0.6) return "bg-indigo-600";
    if (intensity < 0.8) return "bg-indigo-500";
    return "bg-indigo-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">When You Study Best</h3>

      <div className="space-y-4">
        {/* Heatmap Grid */}
        <div className="grid grid-cols-6 gap-1">
          {hourlyStats.map((stat, idx) => {
            const hour = stat.hour;
            const ampm = hour < 12 ? "AM" : "PM";
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

            return (
              <motion.div
                key={hour}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="group relative"
              >
                <div
                  className={`p-3 rounded-lg transition-all cursor-pointer ${getHeatmapColor(
                    stat.sessionsCount,
                    maxSessions
                  )} hover:ring-2 hover:ring-cyan-400`}
                >
                  <div className="text-xs font-bold text-white text-center">
                    {displayHour}
                    {ampm === "AM" ? "a" : "p"}
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 border border-gray-700 rounded-lg p-2 whitespace-nowrap text-xs text-gray-300 z-10 pointer-events-none">
                  <div>{stat.sessionsCount} sessions</div>
                  <div>{stat.totalMinutes}m studied</div>
                  <div>Focus: {stat.avgFocusScore}%</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-4 border-t border-gray-800">
          <span>Intensity:</span>
          <div className="flex gap-1">
            {["bg-gray-800", "bg-indigo-900", "bg-indigo-700", "bg-indigo-600", "bg-indigo-500", "bg-indigo-400"].map(
              (color, idx) => (
                <div key={idx} className={`w-3 h-3 rounded ${color}`} />
              )
            )}
          </div>
          <span className="ml-auto">Low → High</span>
        </div>
      </div>

      {/* Best Hour */}
      {hourlyStats[0] && (
        <div className="mt-6 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Your Peak Study Hour</p>
          <p className="text-xl font-bold text-indigo-400">
            {hourlyStats[0].hour === 0
              ? "12 AM"
              : hourlyStats[0].hour < 12
              ? `${hourlyStats[0].hour} AM`
              : hourlyStats[0].hour === 12
              ? "12 PM"
              : `${hourlyStats[0].hour - 12} PM`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {hourlyStats[0].sessionsCount} sessions • {hourlyStats[0].totalMinutes} minutes
          </p>
        </div>
      )}
    </motion.div>
  );
}