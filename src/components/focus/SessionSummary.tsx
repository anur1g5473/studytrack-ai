"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Award, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

type SessionSummaryProps = {
  duration: number;
  xpEarned: number;
  distractionCount: number;
  completed: boolean;
  onNewSession: () => void;
};

export function SessionSummary({
  duration,
  xpEarned,
  distractionCount,
  completed,
  onNewSession,
}: SessionSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {completed ? "Mission Complete!" : "Session Ended"}
          </h2>
          <p className="text-gray-400">
            {completed ? "Great work!" : "Session paused"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-bold text-indigo-400">{duration}</div>
            <div className="text-xs text-gray-500 mt-1">minutes</div>
          </motion.div>

          {/* XP Earned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400">{xpEarned}</div>
            </div>
            <div className="text-xs text-gray-500">XP earned</div>
          </motion.div>

          {/* Distractions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-bold text-cyan-400">{distractionCount}</div>
            <div className="text-xs text-gray-500 mt-1">distractions</div>
          </motion.div>
        </div>

        {/* Focus Score */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border border-indigo-500/30 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-300">Focus Score</div>
            <div className="text-2xl font-bold text-indigo-400">
              {Math.round(((duration - distractionCount * 5) / duration) * 100)}%
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, ((duration - distractionCount * 5) / duration) * 100)
                )}%`,
              }}
            />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button variant="ghost" className="w-full">
              Dashboard
            </Button>
          </Link>
          <Button
            variant="primary"
            onClick={onNewSession}
            className="flex-1 gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            New Session
          </Button>
        </div>
      </div>
    </motion.div>
  );
}