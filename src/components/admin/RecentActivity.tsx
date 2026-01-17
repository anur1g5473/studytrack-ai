"use client";

type ActivityItem = {
  id: string;
  created_at: string;
  duration_minutes: number;
  mood_environment: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

type RecentActivityProps = {
  data: ActivityItem[];
};

export function RecentActivity({ data }: RecentActivityProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Live Activity Feed</h2>
      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0"
          >
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
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-4">No recent activity found.</p>
        )}
      </div>
    </div>
  );
}