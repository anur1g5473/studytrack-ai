"use client";

import { motion } from "framer-motion";
import type { UserBadge } from "@/types/gamification.types";

type BadgeShowcaseProps = {
  badges: UserBadge[];
};

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  if (badges.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500">No badges earned yet. Keep studying!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Trophy Case</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((userBadge, idx) => (
          <motion.div
            key={userBadge.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition-colors group"
          >
            <div className="text-4xl mb-2 filter drop-shadow-lg group-hover:scale-110 transition-transform">
              {userBadge.badge?.icon || "🏅"}
            </div>
            <p className="font-bold text-white text-sm text-center">
              {userBadge.badge?.name}
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              {userBadge.badge?.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}