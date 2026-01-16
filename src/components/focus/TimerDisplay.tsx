"use client";

import { motion } from "framer-motion";

type TimerDisplayProps = {
  timeFormatted: string;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
};

export function TimerDisplay({
  timeFormatted,
  progress,
  isRunning,
  isPaused,
}: TimerDisplayProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Animated background circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 blur-2xl"
        animate={{
          scale: isRunning ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isRunning ? Infinity : 0,
        }}
      />

      {/* Outer circle with progress */}
      <svg className="absolute w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-700"
        />
        <motion.circle
          cx="128"
          cy="128"
          r="120"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-indigo-500"
          strokeDasharray={`${2 * Math.PI * 120}`}
          strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))",
          }}
        />
      </svg>

      {/* Timer Display */}
      <div className="relative z-10 text-center">
        <motion.div
          className="text-7xl md:text-8xl font-bold text-white font-mono tracking-wider"
          animate={{
            scale: isRunning ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isRunning ? Infinity : 0,
          }}
        >
          {timeFormatted}
        </motion.div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {isRunning && (
            <>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-green-400">Session Active</span>
            </>
          )}
          {isPaused && (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium text-yellow-400">Paused</span>
            </>
          )}
          {!isRunning && !isPaused && (
            <>
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-sm font-medium text-gray-400">Ready to Begin</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}