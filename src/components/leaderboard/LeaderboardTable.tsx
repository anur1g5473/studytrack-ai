"use client";

import { motion } from "framer-motion";
import { Zap, Flame, Trophy } from "lucide-react";
import { sanitizeInput } from "@/lib/utils"; // Import the utility function

type LeaderboardTableProps = {
  users: any[];
  currentUserEmail?: string;
};

export function LeaderboardTable({ users, currentUserEmail }: LeaderboardTableProps) {
  // Filter out top 3, they are shown in cards
  const listUsers = users.slice(3);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-950/50 text-gray-400 text-xs uppercase font-medium">
          <tr>
            <th className="p-4 w-16 text-center">Rank</th>
            <th className="p-4">Agent</th>
            <th className="p-4 text-center">Level</th>
            <th className="p-4 text-right">XP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {listUsers.map((user, index) => {
            const isMe = user.email === currentUserEmail; // Assuming you pass email in user object query or check ID
            const sanitizedFullName = sanitizeInput(user.full_name || "Anonymous");
            const sanitizedStreakDays = sanitizeInput(user.streak_days?.toString() || "0");
            const avatarUrl = sanitizeInput(user.avatar_url || "");

            return (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`group transition-colors ${isMe ? "bg-indigo-900/20 hover:bg-indigo-900/30" : "hover:bg-gray-800/30"}`}
              >
                <td className="p-4 text-center font-mono text-gray-500 font-bold group-hover:text-white">
                  {index + 4}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={sanitizedFullName} className="w-full h-full object-cover" />
                      ) : (
                        sanitizedFullName?.[0]
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isMe ? "text-indigo-400" : "text-white"}`}>
                        {sanitizedFullName} {isMe && "(You)"}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {sanitizedStreakDays} Day Streak
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-300 border border-gray-700">
                    Lvl {user.current_level}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-yellow-500 font-bold">
                  {user.xp_points.toLocaleString()}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}