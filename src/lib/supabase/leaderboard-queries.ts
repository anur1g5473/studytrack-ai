import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function fetchLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, xp_points, current_level, streak_days, avatar_url, mission_goal")
    .order("xp_points", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function fetchUserRank(userId: string) {
  // Get all users ordered by XP to find rank
  // Note: For large apps, use a dedicated rank view/function. For MVP, this works.
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .order("xp_points", { ascending: false });

  if (error) throw error;
  
  const rank = data.findIndex(u => u.id === userId) + 1;
  return rank;
}

export async function checkAndAwardBadges(userId: string) {
  // 1. Get User Stats
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return;

  // 2. Get All Badges
  const { data: badges } = await supabase.from("badges").select("*");
  
  // 3. Get Earned Badges
  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);
    
  const earnedIds = new Set(earned?.map(e => e.badge_id));

  // 4. Check Conditions
  const newBadges = [];
  
  for (const badge of badges || []) {
    if (earnedIds.has(badge.id)) continue;

    let qualified = false;
    if (badge.condition_type === 'xp' && profile.xp_points >= badge.condition_value) qualified = true;
    if (badge.condition_type === 'streak' && profile.streak_days >= badge.condition_value) qualified = true;
    if (badge.condition_type === 'level' && profile.current_level >= badge.condition_value) qualified = true;
    
    if (qualified) {
      newBadges.push({ user_id: userId, badge_id: badge.id });
    }
  }

  // 5. Insert New Badges
  if (newBadges.length > 0) {
    await supabase.from("user_badges").insert(newBadges);
  }
  
  return newBadges.length; // Return count of new badges
}