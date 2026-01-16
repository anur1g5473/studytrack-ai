"use client";

import { motion } from "framer-motion";
import type { StudySession } from "@/types/analytics.types";

type StudyTrendChartProps = {
  sessions: StudySession[];
};

export function StudyTrendChart({ sessions }: StudyTrendChartProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center text-gray-400">
        <p>No study data yet. Start a focus session to see trends!</p>
      </div>
    );
  }

  // Get last 7 days
  const last7Days = sessions.slice(0, 7).reverse();
  const maxDuration = Math.max(...last7Days.map((s) => s.duration), 30);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Study Trend (Last 7 Days)</h3>

      <div className="space-y-4">
        {last7Days.map((session, idx) => {
          const barHeight = (session.duration / maxDuration) * 100;
          const date = new Date(session.date);
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

          return (
            <motion.div
              key={session.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-end gap-4"
            >
              <div className="w-12 text-xs font-medium text-gray-500 text-right">
                {dayName}
              </div>

              <div className="flex-1 flex items-end gap-2">
                {/* Duration Bar */}
                <motion.div
                  className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-lg relative group"
                  style={{ height: `${Math.max(20, barHeight * 0.6)}px` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(20, barHeight * 0.6)}px` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap bg-gray-800 px-2 py-1 rounded text-gray-300">
                    {session.duration}m
                  </div>
                </motion.div>

                {/* XP Bar */}
                <motion.div
                  className="w-8 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg relative group"
                  style={{ height: `${Math.max(20, (session.xpEarned / 300) * 0.6 * 100)}px` }}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.max(20, (session.xpEarned / 300) * 0.6 * 100)}px`,
                  }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap bg-gray-800 px-2 py-1 rounded text-gray-300">
                    {session.xpEarned} XP
                  </div>
                </motion.div>
              </div>

              <div className="w-12 text-xs font-medium text-gray-500">
                {session.focusScore}%
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-6 mt-6 pt-6 border-t border-gray-800">
        <div className="text-xs">
          <div className="text-gray-500 mb-1">Duration</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <span className="text-gray-300">Minutes</span>
          </div>
        </div>
        <div className="text-xs">
          <div className="text-gray-500 mb-1">XP</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600" />
            <span className="text-gray-300">Points</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}