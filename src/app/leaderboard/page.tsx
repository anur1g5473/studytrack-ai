"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { UserRankCard } from "@/components/leaderboard/UserRankCard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useStore();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard${user ? `?userId=${user.id}` : ""}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch leaderboard data");
        }

        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || null);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        // TODO: Implement a more robust client-side error notification (e.g., toast)
      } finally {
        setLoading(false);
      }
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

  const top3 = leaderboard.slice(0, 3);

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

      {userRank && !top3.some(u => u.id === userRank.id) && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Rank</h2>
          <UserRankCard user={userRank} rank={userRank.rank} isCurrentUser={true} />
        </div>
      )}

      {/* The Rest */}
      <LeaderboardTable users={leaderboard} currentUserEmail={user?.email || ""} />
    </div>
  );
}