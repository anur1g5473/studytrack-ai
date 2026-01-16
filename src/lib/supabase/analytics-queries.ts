import { createClient } from "@/lib/supabase/client";
import type {
  AnalyticsData,
  StudySession,
  SubjectProgress,
  HourlyStats,
  DistractionStats,
} from "@/types/analytics.types";

const supabase = createClient();

export async function fetchAnalyticsData(
  userId: string,
  daysBack: number = 30
): Promise<AnalyticsData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Fetch focus sessions
  const { data: sessions } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // Fetch syllabus data
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", userId);

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", userId);

  // Process data
  const studySessions = processSessions(sessions || []);
  const subjectProgress = await processSubjectProgress(userId, subjects || []);
  const hourlyStats = processHourlyStats(sessions || []);
  const distractionStats = processDistractionStats(sessions || []);

  const totalStudyHours = (sessions || []).reduce(
    (sum, s) => sum + (s.duration_minutes || 0),
    0
  ) / 60;
  const totalSessions = sessions?.length || 0;
  const averageFocusScore =
    totalSessions > 0
      ? Math.round(
          (sessions || []).reduce((sum, s) => sum + (s.completed ? 100 : 50), 0) /
            totalSessions
        )
      : 0;
  const totalXPEarned = (sessions || []).reduce(
    (sum, s) => sum + (s.xp_earned || 0),
    0
  );
  const completionRate = topics
    ? Math.round(
        ((topics.filter((t) => t.status === "completed").length / topics.length) * 100) || 0
      )
    : 0;

  return {
    totalStudyHours: Math.round(totalStudyHours * 10) / 10,
    totalSessions,
    averageFocusScore,
    totalXPEarned,
    bestStudyHour: hourlyStats[0]?.hour || 0,
    currentStreak: profile?.streak_days || 0,
    completionRate,
    studySessions,
    subjectProgress,
    hourlyStats,
    distractionStats,
  };
}

function processSessions(sessions: any[]): StudySession[] {
  const sessionMap = new Map<string, StudySession>();

  sessions.forEach((session) => {
    const date = new Date(session.created_at).toISOString().split("T")[0];

    if (sessionMap.has(date)) {
      const existing = sessionMap.get(date)!;
      existing.duration += session.duration_minutes || 0;
      existing.xpEarned += session.xp_earned || 0;
      existing.distractions += session.distraction_count || 0;
    } else {
      sessionMap.set(date, {
        date,
        duration: session.duration_minutes || 0,
        xpEarned: session.xp_earned || 0,
        distractions: session.distraction_count || 0,
        focusScore: session.completed ? 100 : 50,
      });
    }
  });

  return Array.from(sessionMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function processSubjectProgress(
  userId: string,
  subjects: any[]
): Promise<SubjectProgress[]> {
  const progress: SubjectProgress[] = [];

  for (const subject of subjects) {
    const { data: chapters } = await supabase
      .from("chapters")
      .select("*")
      .eq("subject_id", subject.id);

    const { data: topics } = await supabase
      .from("topics")
      .select("*")
      .eq("user_id", userId)
      .in(
        "chapter_id",
        (chapters || []).map((c) => c.id)
      );

    const total = topics?.length || 0;
    const completed = topics?.filter((t) => t.status === "completed").length || 0;
    const estimatedHours =
      (topics?.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0) || 0) / 60;

    progress.push({
      name: subject.name,
      color: subject.color,
      completed,
      total,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      hoursSpent: 0, // Will be updated from sessions if needed
    });
  }

  return progress;
}

function processHourlyStats(sessions: any[]): HourlyStats[] {
  const hourMap = new Map<number, { count: number; minutes: number; focus: number }>();

  sessions.forEach((session) => {
    const hour = new Date(session.created_at).getHours();
    const existing = hourMap.get(hour) || { count: 0, minutes: 0, focus: 0 };

    hourMap.set(hour, {
      count: existing.count + 1,
      minutes: existing.minutes + (session.duration_minutes || 0),
      focus: existing.focus + (session.completed ? 100 : 50),
    });
  });

  return Array.from({ length: 24 }, (_, i) => {
    const data = hourMap.get(i);
    return {
      hour: i,
      sessionsCount: data?.count || 0,
      totalMinutes: data?.minutes || 0,
      avgFocusScore: data ? Math.round(data.focus / data.count) : 0,
    };
  }).sort((a, b) => b.sessionsCount - a.sessionsCount);
}

function processDistractionStats(sessions: any[]): DistractionStats[] {
  const distractionMap = new Map<string, number>();
  let totalDistractions = 0;

  sessions.forEach((session) => {
    const distractions = session.distractions || [];
    distractions.forEach((d: any) => {
      const type = d.type || "other";
      distractionMap.set(type, (distractionMap.get(type) || 0) + 1);
      totalDistractions++;
    });
  });

  return Array.from(distractionMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalDistractions) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}