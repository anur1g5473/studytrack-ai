import { createClient } from "@/lib/supabase/client";
import type { FocusSession } from "@/types/focus.types";
import { MOOD_ENVIRONMENTS } from "@/types/focus.types"; // Import MOOD_ENVIRONMENTS

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

  // Server-side input validation
  const { duration_minutes, mood_environment, topic_id, subject_id } = data;

  if (typeof duration_minutes !== "number" || duration_minutes < 5 || duration_minutes > 120) {
    throw new Error("Invalid session duration. Must be between 5 and 120 minutes.");
  }

  if (!MOOD_ENVIRONMENTS.some(env => env.id === mood_environment)) {
    throw new Error("Invalid mood environment.");
  }

  // Ensure topic_id and subject_id are valid if provided
  // For full validation, you would query to ensure these IDs exist and belong to the user.
  // This is covered by the RLS recommendation, but further validation here is good defense-in-depth.
  
  const { data: session, error } = await supabase
    .from("focus_sessions")
    .insert({
      user_id: userId,
      duration_minutes,
      mood_environment,
      topic_id,
      subject_id,
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
