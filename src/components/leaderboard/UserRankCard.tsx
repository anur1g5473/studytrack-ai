"use client";

import { motion } from "framer-motion";
import { Crown, Zap } from "lucide-react";

type UserRankCardProps = {
  user: any;
  rank: 1 | 2 | 3;
};

export function UserRankCard({ user, rank }: UserRankCardProps) {
  const colors = {
    1: "from-yellow-400 to-orange-500 border-yellow-500/50",
    2: "from-gray-300 to-gray-400 border-gray-400/50",
    3: "from-orange-700 to-orange-600 border-orange-700/50",
  };

  const glow = {
    1: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    2: "shadow-[0_0_20px_rgba(156,163,175,0.2)]",
    3: "shadow-[0_0_20px_rgba(194,65,12,0.2)]",
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`relative p-6 rounded-2xl border bg-gray-900/80 backdrop-blur-sm flex flex-col items-center ${colors[rank]} ${glow[rank]} border-t-4`}
    >
      <div className="absolute -top-6">
        {rank === 1 && <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400/20 animate-bounce" />}
        {rank === 2 && <span className="text-4xl font-bold text-gray-400">#2</span>}
        {rank === 3 && <span className="text-4xl font-bold text-orange-700">#3</span>}
      </div>

      <div className="mt-4 w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold text-white mb-3">
        {user.full_name?.[0]}
      </div>

      <h3 className="text-lg font-bold text-white truncate w-full text-center">
        {user.full_name}
      </h3>
      <p className="text-xs text-gray-400 mb-3">{user.mission_goal}</p>

      <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="font-mono font-bold text-yellow-100">{user.xp_points} XP</span>
      </div>
    </motion.div>
  );
}