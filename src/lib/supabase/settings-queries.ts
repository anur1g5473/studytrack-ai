import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string;
  avatar_url?: string;
  mission_goal?: string;
  exam_date?: string | null;
  daily_study_hours?: number;
}) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}