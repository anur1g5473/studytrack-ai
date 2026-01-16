"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { fetchAnalyticsData } from "@/lib/supabase/analytics-queries";
import { ProgressCard } from "./ProgressCard";
import { StudyTrendChart } from "./StudyTrendChart";
import { FocusHeatmap } from "./FocusHeatmap";
import { DistractionAnalysis } from "./DistractionAnalysis";
import { SubjectBreakdown } from "./SubjectBreakdown";
import { XPProgression } from "./XPProgression";
import { BarChart3, Flame, Zap, Target, Clock } from "lucide-react";
import type { AnalyticsData } from "@/types/analytics.types";

export function AnalyticsDashboard() {
  const { user } = useStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await fetchAnalyticsData(user.id, daysBack);
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user, daysBack]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
            Your Analytics
          </h1>
          <p className="text-gray-400">Track your progress and identify patterns</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setDaysBack(days)}
              className={`px-4 py-2 rounded-lg transition-all ${
                daysBack === days
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:text-white"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard
          title="Total Study Hours"
          value={analytics.totalStudyHours}
          unit="hours"
          icon={<Clock className="w-5 h-5" />}
          color="indigo"
        />
        <ProgressCard
          title="Focus Sessions"
          value={analytics.totalSessions}
          icon={<Target className="w-5 h-5" />}
          color="cyan"
          percentage={Math.min(analytics.totalSessions, 100)}
        />
        <ProgressCard
          title="Current Streak"
          value={analytics.currentStreak}
          unit="days"
          icon={<Flame className="w-5 h-5" />}
          color="green"
        />
        <ProgressCard
          title="Syllabus Completion"
          value={analytics.completionRate}
          unit="%"
          icon={<Zap className="w-5 h-5" />}
          color="yellow"
          percentage={analytics.completionRate}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <StudyTrendChart sessions={analytics.studySessions} />
        <FocusHeatmap hourlyStats={analytics.hourlyStats} />
      </div>

      {/* Subject & Distraction */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SubjectBreakdown subjects={analytics.subjectProgress} />
        <DistractionAnalysis distractions={analytics.distractionStats} />
      </div>

      {/* XP Progression */}
      <XPProgression
        currentXP={user?.xp_points || 0}
        currentLevel={user?.current_level || 1}
        totalXPEarned={analytics.totalXPEarned}
        totalSessions={analytics.totalSessions}
        averageFocusScore={analytics.averageFocusScore}
      />
    </div>
  );
}