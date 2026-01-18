"use client";

import { useEffect, useState } from "react";
// Removed imports from @/lib/supabase/admin-queries
import { Users, Clock, Zap, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsResponse = await fetch("/api/admin/stats");
        const statsData = await statsResponse.json();
        if (statsResponse.ok) {
          setStats(statsData);
        } else {
          throw new Error(statsData.error || "Failed to fetch admin statistics.");
        }

        const activityResponse = await fetch("/api/admin/activity");
        const activityData = await activityResponse.json();
        if (activityResponse.ok) {
          setActivity(activityData);
        } else {
          throw new Error(activityData.error || "Failed to fetch recent activity.");
        }
      } catch (err: any) {
        console.error("Admin Dashboard Data Error:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="text-white">Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Dummy data for now, replace with actual values from stats object when available
  // For now, I'll assume `stats` object contains these keys directly from the API.
  const totalUsers = stats?.totalUsers || 0;
  const totalHours = "N/A"; // Not directly calculated in the API yet, needs aggregation
  const totalSessions = stats?.activeSessions || 0; // Using activeSessions as placeholder
  const activeUsers = "N/A"; // Not directly calculated in the API yet, needs aggregation

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">System Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-green-400 text-sm">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{totalUsers}</h3>
          <p className="text-gray-400 text-sm">Total Users</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{totalHours}</h3>
          <p className="text-gray-400 text-sm">Hours Studied</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{totalSessions}</h3>
          <p className="text-gray-400 text-sm">Focus Sessions</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{activeUsers}</h3>
          <p className="text-gray-400 text-sm">Active (7d)</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Live Activity Feed</h2>
        <div className="space-y-4">
          {activity.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                  {item.profiles?.full_name?.[0] || "U"}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {item.profiles?.full_name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Completed {item.duration_minutes}m session ({item.mood_environment})
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
