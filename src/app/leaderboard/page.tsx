"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard, checkAndAwardBadges } from "@/lib/supabase/leaderboard-queries";
import { useStore } from "@/store/useStore";
import { UserRankCard } from "@/components/leaderboard/UserRankCard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1. Check for badges for current user
      if (user) {
        await checkAndAwardBadges(user.id);
      }

      // 2. Fetch Leaderboard
      const data = await fetchLeaderboard();
      setUsers(data || []);
      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const top3 = users.slice(0, 3);

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold text-white">Global Rankings</h1>
        <p className="text-gray-400">Compete with other agents. Earn XP to climb the ranks.</p>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Order: 2, 1, 3 for visual podium effect */}
          {top3[1] && <div className="order-2 md:order-1"><UserRankCard user={top3[1]} rank={2} /></div>}
          {top3[0] && <div className="order-1 md:order-2 -mt-12 z-10"><UserRankCard user={top3[0]} rank={1} /></div>}
          {top3[2] && <div className="order-3 md:order-3"><UserRankCard user={top3[2]} rank={3} /></div>}
        </div>
      )}

      {/* The Rest */}
      <LeaderboardTable users={users} currentUserEmail={user?.email || ""} />
    </div>
  );
}