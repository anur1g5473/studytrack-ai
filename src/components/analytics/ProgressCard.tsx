"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";

type ProgressCardProps = {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  percentage?: number;
  color: "indigo" | "cyan" | "green" | "yellow" | "red";
};

const colorClasses = {
  indigo: "text-indigo-400 bg-indigo-600/20",
  cyan: "text-cyan-400 bg-cyan-600/20",
  green: "text-green-400 bg-green-600/20",
  yellow: "text-yellow-400 bg-yellow-600/20",
  red: "text-red-400 bg-red-600/20",
};

export function ProgressCard({
  title,
  value,
  unit,
  icon,
  percentage,
  color,
}: ProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-white">
            {value}
            {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
          </div>
        </div>

        {percentage !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-bold text-gray-300">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}