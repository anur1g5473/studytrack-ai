import { createClient } from "@/lib/supabase/client";
import type { Profile, Subject, Chapter, Topic } from "@/types/database.types";

export type AIContext = {
  user: {
    name: string;
    missionGoal: string;
    examDate: string | null;
    dailyStudyHours: number;
    xpPoints: number;
    currentLevel: number;
    streakDays: number;
  };
  syllabus: {
    totalSubjects: number;
    totalChapters: number;
    totalTopics: number;
    completedTopics: number;
    inProgressTopics: number;
    completionPercent: number;
    subjects: {
      name: string;
      color: string;
      chapters: {
        name: string;
        topics: {
          name: string;
          status: string;
          difficulty: string;
          estimatedMinutes: number;
        }[];
      }[];
    }[];
  };
  recentSessions: {
    date: string;
    durationMinutes: number;
    xpEarned: number;
    distractionCount: number;
    completed: boolean;
  }[];
  analytics: {
    totalStudyHours: number;
    totalSessions: number;
    averageSessionLength: number;
    mostProductiveHour: number;
    weakTopics: string[];
    strongTopics: string[];
  };
};

export async function fetchAIContext(userId: string): Promise<AIContext> {
  const supabase = createClient();

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // Fetch subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", userId)
    .order("order_index");

  // Fetch all chapters
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("user_id", userId)
    .order("order_index");

  // Fetch all topics
  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", userId)
    .order("order_index");

  // Fetch recent focus sessions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: sessions } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  // Process syllabus data
  const subjectsList = (subjects || []).map((subject) => {
    const subjectChapters = (chapters || []).filter(
      (c) => c.subject_id === subject.id
    );

    return {
      name: subject.name,
      color: subject.color,
      chapters: subjectChapters.map((chapter) => {
        const chapterTopics = (topics || []).filter(
          (t) => t.chapter_id === chapter.id
        );

        return {
          name: chapter.name,
          topics: chapterTopics.map((topic) => ({
            name: topic.name,
            status: topic.status,
            difficulty: topic.difficulty,
            estimatedMinutes: topic.estimated_minutes,
          })),
        };
      }),
    };
  });

  // Calculate stats
  const allTopics = topics || [];
  const completedTopics = allTopics.filter((t) => t.status === "completed");
  const inProgressTopics = allTopics.filter((t) => t.status === "in_progress");
  const notStartedTopics = allTopics.filter((t) => t.status === "not_started");

  // Identify weak topics (hard + not completed)
  const weakTopics = allTopics
    .filter((t) => t.difficulty === "hard" && t.status !== "completed")
    .slice(0, 5)
    .map((t) => t.name);

  // Identify strong topics (completed + easy/medium)
  const strongTopics = allTopics
    .filter((t) => t.status === "completed")
    .slice(0, 5)
    .map((t) => t.name);

  // Process sessions
  const recentSessions = (sessions || []).map((s) => ({
    date: s.created_at,
    durationMinutes: s.duration_minutes,
    xpEarned: s.xp_earned,
    distractionCount: s.distraction_count,
    completed: s.completed,
  }));

  const totalStudyMinutes = recentSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );

  return {
    user: {
      name: profile?.full_name || "Student",
      missionGoal: profile?.mission_goal || "General Study",
      examDate: profile?.exam_date || null,
      dailyStudyHours: profile?.daily_study_hours || 4,
      xpPoints: profile?.xp_points || 0,
      currentLevel: profile?.current_level || 1,
      streakDays: profile?.streak_days || 0,
    },
    syllabus: {
      totalSubjects: subjects?.length || 0,
      totalChapters: chapters?.length || 0,
      totalTopics: allTopics.length,
      completedTopics: completedTopics.length,
      inProgressTopics: inProgressTopics.length,
      completionPercent:
        allTopics.length > 0
          ? Math.round((completedTopics.length / allTopics.length) * 100)
          : 0,
      subjects: subjectsList,
    },
    recentSessions,
    analytics: {
      totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
      totalSessions: recentSessions.length,
      averageSessionLength:
        recentSessions.length > 0
          ? Math.round(totalStudyMinutes / recentSessions.length)
          : 0,
      mostProductiveHour: 10, // Default, can be calculated from sessions
      weakTopics,
      strongTopics,
    },
  };
}

export function formatContextForAI(context: AIContext): string {
  const { user, syllabus, recentSessions, analytics } = context;

  // Calculate days until exam
  let daysUntilExam = "Not set";
  if (user.examDate) {
    const examDate = new Date(user.examDate);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysUntilExam = diffDays > 0 ? `${diffDays} days` : "Passed";
  }

  // Build subjects summary
  let subjectsSummary = "";
  syllabus.subjects.forEach((subject) => {
    const totalTopics = subject.chapters.reduce(
      (sum, ch) => sum + ch.topics.length,
      0
    );
    const completedTopics = subject.chapters.reduce(
      (sum, ch) => sum + ch.topics.filter((t) => t.status === "completed").length,
      0
    );
    const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    subjectsSummary += `\n  - ${subject.name}: ${completedTopics}/${totalTopics} topics (${percent}% complete)`;

    subject.chapters.forEach((chapter) => {
      const chapterComplete = chapter.topics.filter(
        (t) => t.status === "completed"
      ).length;
      subjectsSummary += `\n    • ${chapter.name}: ${chapterComplete}/${chapter.topics.length} topics`;
    });
  });

  // Build weak topics list
  const weakTopicsList =
    analytics.weakTopics.length > 0
      ? analytics.weakTopics.join(", ")
      : "None identified yet";

  // Build recent activity
  let recentActivity = "";
  if (recentSessions.length > 0) {
    recentActivity = recentSessions
      .slice(0, 5)
      .map(
        (s) =>
          `${new Date(s.date).toLocaleDateString()}: ${s.durationMinutes}min, ${s.xpEarned} XP`
      )
      .join("\n  ");
  } else {
    recentActivity = "No recent sessions";
  }

  return `
=== STUDENT PROFILE ===
Name: ${user.name}
Mission Goal: ${user.missionGoal}
Exam Date: ${user.examDate || "Not set"} (${daysUntilExam} remaining)
Daily Study Target: ${user.dailyStudyHours} hours
Current Level: ${user.currentLevel}
XP Points: ${user.xpPoints}
Study Streak: ${user.streakDays} days

=== SYLLABUS OVERVIEW ===
Total Subjects: ${syllabus.totalSubjects}
Total Chapters: ${syllabus.totalChapters}
Total Topics: ${syllabus.totalTopics}
Completed: ${syllabus.completedTopics} (${syllabus.completionPercent}%)
In Progress: ${syllabus.inProgressTopics}
Not Started: ${syllabus.totalTopics - syllabus.completedTopics - syllabus.inProgressTopics}

=== SUBJECTS DETAIL ===${subjectsSummary || "\n  No subjects added yet"}

=== WEAK AREAS (Need Attention) ===
${weakTopicsList}

=== RECENT STUDY ACTIVITY (Last 7 Days) ===
Total Hours: ${analytics.totalStudyHours}
Total Sessions: ${analytics.totalSessions}
Avg Session: ${analytics.averageSessionLength} minutes

Recent Sessions:
  ${recentActivity}
`;
}