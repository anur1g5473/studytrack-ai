import { createClient } from "@/lib/supabase/client";
import type { FocusSession } from "@/types/focus.types";

export async function createFocusSession(
  userId: string,
  data: {
    duration_minutes: number;
    mood_environment: string;
    topic_id?: string;
    subject_id?: string;
  }
) {
  const supabase = createClient();

  const { data: session, error } = await supabase
    .from("focus_sessions")
    .insert({
      user_id: userId,
      ...data,
      completed: false,
      xp_earned: 0,
      distraction_count: 0,
      distractions: [],
    })
    .select()
    .single();

  if (error) throw error;
  return session as FocusSession;
}

export async function updateFocusSession(
  sessionId: string,
  updates: Partial<FocusSession>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("focus_sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as FocusSession;
}

export async function completeFocusSession(
  sessionId: string,
  userId: string,
  {
    xpEarned,
    completed,
    distractions,
  }: {
    xpEarned: number;
    completed: boolean;
    distractions: any[];
  }
) {
  const supabase = createClient();

  // Update session
  const { data: session, error: sessionError } = await supabase
    .from("focus_sessions")
    .update({
      completed,
      xp_earned: xpEarned,
      distraction_count: distractions.length,
      distractions,
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Update user XP and level
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_points, current_level")
    .eq("id", userId)
    .single();

  if (profile) {
    const newXp = profile.xp_points + xpEarned;
    const newLevel = Math.floor(newXp / 1000) + 1;

    await supabase
      .from("profiles")
      .update({
        xp_points: newXp,
        current_level: newLevel,
        last_study_date: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  return session as FocusSession;
}

export async function fetchUserSessions(userId: string, limit = 10) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as FocusSession[];
}

export async function fetchTodaySessions(userId: string) {
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as FocusSession[];
}