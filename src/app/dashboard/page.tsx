"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar, Target, Clock, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading mission control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back,{" "}
          <span className="text-indigo-400">{user.full_name?.split(" ")[0] || "Agent"}</span>
        </h1>
        <p className="text-gray-400">
          Ready to continue your mission? Here's what's next.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Target className="w-4 h-4" />
            <div className="text-sm">Mission Goal</div>
          </div>
          <div className="text-2xl font-bold text-white">{user.mission_goal}</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Calendar className="w-4 h-4" />
            <div className="text-sm">Exam Date</div>
          </div>
          <div className="text-lg font-bold text-white">
            {user.exam_date
              ? new Date(user.exam_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Not Set"}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <div className="text-sm">Daily Hours</div>
          </div>
          <div className="text-2xl font-bold text-white">{user.daily_study_hours}h</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Zap className="w-4 h-4" />
            <div className="text-sm">XP Points</div>
          </div>
          <div className="text-2xl font-bold text-indigo-400">{user.xp_points}</div>
        </div>
      </div>

      {/* Level & Streak */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Level */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Agent Level
          </h2>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-indigo-400">
              Level {user.current_level}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress to Next Level</span>
                <span className="text-sm font-bold text-white">
                  {user.xp_points % 1000} / 1000 XP
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(user.xp_points % 1000) / 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🔥 Study Streak
          </h2>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-orange-400">
              {user.streak_days} Days
            </div>
            <p className="text-sm text-gray-400">Keep it up! Don't break the chain.</p>
            <div className="grid grid-cols-7 gap-1 mt-4">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg ${
                    i < user.streak_days
                      ? "bg-gradient-to-br from-orange-500 to-red-500"
                      : "bg-gray-800"
                  }`}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/syllabus" className="block">
            <button className="w-full flex flex-col items-center justify-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-indigo-500 transition-all group">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600/30">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-sm font-medium text-white text-center">Manage Syllabus</div>
            </button>
          </Link>

          <button className="w-full flex flex-col items-center justify-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-cyan-500 transition-all group opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-sm font-medium text-white">Focus Mode</div>
            <div className="text-xs text-gray-500 mt-1">Coming Soon</div>
          </button>

          <button className="w-full flex flex-col items-center justify-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-green-500 transition-all group opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-sm font-medium text-white">View Plan</div>
            <div className="text-xs text-gray-500 mt-1">Coming Soon</div>
          </button>

          <button className="w-full flex flex-col items-center justify-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-purple-500 transition-all group opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-sm font-medium text-white">Flashcards</div>
            <div className="text-xs text-gray-500 mt-1">Coming Soon</div>
          </button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600/10 to-cyan-600/10 border border-indigo-500/30 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Ready to Start?</h2>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Set up your syllabus, create a study plan, and start your mission to academic
          excellence.
        </p>
        <Link href="/syllabus">
          <Button size="lg" className="gap-2">
            Go to Syllabus Manager
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}