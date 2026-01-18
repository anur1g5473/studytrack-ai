"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
// import { fetchAnalyticsData } from "@/lib/supabase/analytics-queries"; // Removed direct Supabase query
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
  const [error, setError] = useState<string | null>(null); // Added error state
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await fetch(`/api/analytics?daysBack=${daysBack}`);
        const data = await response.json();

        if (response.ok) {
          setAnalytics(data);
        } else {
          throw new Error(data.error || "Failed to load analytics data.");
        }
      } catch (err: any) {
        console.error("Failed to load analytics:", err); // Log detailed error server-side via API route
        setError(err.message || "Failed to load analytics data. Please try again later."); // User-friendly error
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error}</p>
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
          value={analytics.totalStudyTime ? Math.round(analytics.totalStudyTime / 60) : 0}
          unit="hours"
          icon={<Clock className="w-5 h-5" />}
          color="indigo"
        />
        <ProgressCard
          title="Total XP Earned"
          value={analytics.totalXpEarned}
          icon={<Target className="w-5 h-5" />}
          color="cyan"
          // Assuming a max XP for a meaningful percentage, or remove percentage if not applicable
          // percentage={Math.min(analytics.totalXpEarned, 100)} 
        />
        <ProgressCard
          title="Total Distractions"
          value={analytics.totalDistractions}
          unit="times"
          icon={<Flame className="w-5 h-5" />}
          color="red"
        />
        <ProgressCard
          title="Syllabus Completion"
          value={analytics.profile?.current_level || 1}
          unit="Level"
          icon={<Zap className="w-5 h-5" />}
          color="yellow"
          // percentage={analytics.completionRate} // Completion rate needs to be calculated in API
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <StudyTrendChart sessions={analytics.focusScoreHistory.map(item => ({ date: item.date, duration: item.score }))} /> {/* Mapping focusScoreHistory to StudyTrendChart expected prop */}
        <FocusHeatmap hourlyStats={[]} /> {/* hourlyStats not directly available yet, needs further aggregation in API */}
      </div>

      {/* Subject & Distraction */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SubjectBreakdown subjects={analytics.subjects} />
        <DistractionAnalysis distractions={[]} /> {/* Distraction analysis needs to be formatted in API */}
      </div>

      {/* XP Progression */}
      <XPProgression
        currentXP={analytics.profile?.xp_points || 0}
        currentLevel={analytics.profile?.current_level || 1}
        totalXPEarned={analytics.totalXpEarned}
        totalSessions={analytics.focusScoreHistory.length} // Using focus session count as total sessions
        averageFocusScore={analytics.focusScoreHistory.reduce((sum, item) => sum + item.score, 0) / analytics.focusScoreHistory.length || 0}
      />
    </div>
  );
}
