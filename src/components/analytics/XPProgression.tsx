"use client";

import { motion } from "framer-motion";

type XPProgressionProps = {
  currentXP: number;
  currentLevel: number;
  totalXPEarned: number;
  totalSessions: number;
  averageFocusScore: number;
};

export function XPProgression({
  currentXP,
  currentLevel,
  totalXPEarned,
  totalSessions,
  averageFocusScore,
}: XPProgressionProps) {
  const xpForNextLevel = 1000;
  const xpInCurrentLevel = currentXP % xpForNextLevel;
  const progressToNextLevel = (xpInCurrentLevel / xpForNextLevel) * 100;

  // Calculate XP per session average
  const avgXPPerSession = totalSessions > 0 ? Math.round(totalXPEarned / totalSessions) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-indigo-600/10 to-cyan-600/10 border border-indigo-500/30 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">XP & Level Progression</h3>

      <div className="space-y-6">
        {/* Current Level */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Level</p>
              <p className="text-5xl font-bold text-indigo-400">{currentLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Progress</p>
              <p className="text-2xl font-bold text-cyan-400">{xpInCurrentLevel}/1000</p>
            </div>
          </div>

          {/* Progress Bar */}
          <motion.div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
          <p className="text-xs text-gray-500 mt-2">
            {xpForNextLevel - xpInCurrentLevel} XP until Level {currentLevel + 1}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-indigo-500/20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <p className="text-xs text-gray-500 mb-1">Total XP</p>
            <p className="text-lg font-bold text-indigo-300">{totalXPEarned}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-xs text-gray-500 mb-1">Avg XP/Session</p>
            <p className="text-lg font-bold text-cyan-300">{avgXPPerSession}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-xs text-gray-500 mb-1">Focus Score</p>
            <p className="text-lg font-bold text-green-400">{averageFocusScore}%</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}