import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Subject, Chapter, Topic } from "@/types/database.types";
import type { FocusSession } from "@/types/focus.types";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch Focus Sessions
    const { data: focusSessions, error: focusSessionError } = await supabase
      .from("focus_sessions")
      .select("id, duration_minutes, xp_earned, distraction_count, distractions, created_at, topic_id, subject_id")
      .eq("user_id", user.id) // RLS enforced by query, though Supabase policies are primary
      .order("created_at", { ascending: false });
    if (focusSessionError) throw focusSessionError;

    // Fetch User Profile (for last_study_date, current_level, xp_points)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, current_level, xp_points, last_study_date")
      .eq("id", user.id)
      .single();
    if (profileError) throw profileError;

    // Fetch Syllabus data (subjects, chapters, topics)
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select(`
        id,
        name,
        chapters(
          id,
          name,
          topics(
            id,
            name,
            difficulty
          )
        )
      `)
      .eq("user_id", user.id) // RLS enforced by query
      .order("created_at", { ascending: true });
    if (subjectsError) throw subjectsError;

    // --- Aggregate Data (moved from client-side) ---

    let totalStudyTime = 0; // in minutes
    let totalXpEarned = 0;
    let totalDistractions = 0;
    const studyTimeBySubject: { [key: string]: number } = {};
    const studyTimeByTopic: { [key: string]: number } = {};
    const xpBySubject: { [key: string]: number } = {};
    const distractionCountBySubject: { [key: string]: number } = {};
    const focusScoreHistory: { date: string; score: number }[] = [];

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    focusSessions.forEach((session: any) => {
      totalStudyTime += session.duration_minutes;
      totalXpEarned += session.xp_earned;
      totalDistractions += session.distraction_count;

      if (session.subject_id) {
        studyTimeBySubject[session.subject_id] = (studyTimeBySubject[session.subject_id] || 0) + session.duration_minutes;
        xpBySubject[session.subject_id] = (xpBySubject[session.subject_id] || 0) + session.xp_earned;
        distractionCountBySubject[session.subject_id] = (distractionCountBySubject[session.subject_id] || 0) + session.distraction_count;
      }
      if (session.topic_id) {
        studyTimeByTopic[session.topic_id] = (studyTimeByTopic[session.topic_id] || 0) + session.duration_minutes;
      }

      const sessionDate = new Date(session.created_at);
      if (sessionDate > oneWeekAgo) {
        // Calculate a simple focus score (can be refined)
        const rawFocusTime = session.duration_minutes * 60; // seconds
        const effectiveFocusTime = Math.max(0, rawFocusTime - (session.distraction_count * 30)); // Penalize 30s per distraction
        const score = rawFocusTime > 0 ? (effectiveFocusTime / rawFocusTime) * 100 : 0;
        focusScoreHistory.push({
          date: sessionDate.toISOString().split('T')[0],
          score: parseFloat(score.toFixed(2)),
        });
      }
    });

    // Flatten syllabus for easier lookup
    const allTopics: { [key: string]: Topic } = {};
    subjects.forEach((s: any) => {
      s.chapters.forEach((c: any) => {
        c.topics.forEach((t: any) => {
          allTopics[t.id] = t;
        });
      });
    });

    // Enhance subject data with aggregated stats and detailed topics
    const subjectsWithStats = subjects.map((subject: any) => ({
      ...subject,
      totalStudyTime: studyTimeBySubject[subject.id] || 0,
      totalXp: xpBySubject[subject.id] || 0,
      totalDistractions: distractionCountBySubject[subject.id] || 0,
      chapters: subject.chapters.map((chapter: any) => ({
        ...chapter,
        topics: chapter.topics.map((topic: any) => ({
          ...topic,
          totalStudyTime: studyTimeByTopic[topic.id] || 0,
        })),
      })),
    }));

    return NextResponse.json({
      profile,
      totalStudyTime,
      totalXpEarned,
      totalDistractions,
      subjects: subjectsWithStats,
      focusScoreHistory: focusScoreHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      // Other aggregated data can be added here
    });
  } catch (error: any) {
    console.error("API Analytics GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "Failed to fetch analytics data." }, { status: 500 });
  }
}
