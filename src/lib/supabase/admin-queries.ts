import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function fetchAdminStats() {
  // Total Users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Total Study Hours
  const { data: profiles } = await supabase
    .from("profiles")
    .select("xp_points"); // We can estimate hours from XP for now or sum sessions
  
  // Actually better to query focus_sessions if RLS allows or use RPC
  // For now let's sum session durations
  const { data: sessions } = await supabase
    .from("focus_sessions")
    .select("duration_minutes");
    
  const totalMinutes = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
  const totalHours = Math.round(totalMinutes / 60);

  // Active Users (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: activeUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("last_study_date", sevenDaysAgo.toISOString());

  return {
    totalUsers: totalUsers || 0,
    totalHours,
    activeUsers: activeUsers || 0,
    totalSessions: sessions?.length || 0
  };
}

export async function fetchAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchRecentActivity() {
  const { data, error } = await supabase
    .from("focus_sessions")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

export async function updateUserStatus(userId: string, updates: any) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
}

export async function toggleUserBan(userId: string, currentStatus: boolean) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: !currentStatus })
    .eq("id", userId);
  if (error) throw error;
}

export async function toggleUserAdmin(userId: string, currentStatus: boolean) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: !currentStatus })
    .eq("id", userId);
  if (error) throw error;
}

export async function createAnnouncement(message: string, type: "info" | "warning" | "alert") {
  const { error } = await supabase
    .from("announcements")
    .insert({ message, type, is_active: true });
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
export async function fetchAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}