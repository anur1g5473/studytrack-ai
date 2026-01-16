"use client";

import { motion } from "framer-motion";
import type { SubjectProgress } from "@/types/analytics.types";
import { CheckCircle2, Clock } from "lucide-react";

type SubjectBreakdownProps = {
  subjects: SubjectProgress[];
};

export function SubjectBreakdown({ subjects }: SubjectBreakdownProps) {
  if (subjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center text-gray-400"
      >
        <p>No subjects yet. Add subjects in your syllabus to track progress!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Subject Progress</h3>

      <div className="space-y-5">
        {subjects.map((subject, idx) => (
          <motion.div
            key={subject.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="space-y-2"
          >
            {/* Subject Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {subject.name}
                  </h4>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {subject.completed}/{subject.total} topics
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {subject.estimatedHours}h
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-400">
                  {subject.completionPercent}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div className="w-full bg-gray-800 rounded-full h-2.5">
              <motion.div
                className="h-2.5 rounded-full transition-all"
                style={{
                  backgroundColor: subject.color,
                  boxShadow: `0 0 10px ${subject.color}`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${subject.completionPercent}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {subjects.reduce((sum, s) => sum + s.completed, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Topics Done</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {subjects.reduce((sum, s) => sum + s.total, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Topics</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(
              (subjects.reduce((sum, s) => sum + s.completionPercent, 0) /
                subjects.length) *
                10
            ) / 10}
            %
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg Progress</div>
        </div>
      </div>
    </motion.div>
  );
}