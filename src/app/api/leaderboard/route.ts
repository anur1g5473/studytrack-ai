import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { UserRank } from "@/types/gamification.types"; // Assuming UserRank type is defined

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch top users for leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, xp_points, current_level")
      .order("xp_points", { ascending: false })
      .limit(100); // Limit to top 100 users
    if (leaderboardError) throw leaderboardError;

    // Fetch current user's rank and surrounding users
    let userRank: UserRank | null = null;
    let usersAroundMe: UserRank[] = [];

    // This is an inefficient way to get user rank directly from frontend. 
    // Ideally, a Supabase function (RPC) or a materialized view should calculate ranks efficiently.
    // For now, we simulate fetching user's rank based on fetched leaderboard data.
    const sortedLeaderboard = leaderboard.sort((a, b) => b.xp_points - a.xp_points);
    const currentUserIndex = sortedLeaderboard.findIndex(p => p.id === user.id);

    if (currentUserIndex !== -1) {
      userRank = { ...sortedLeaderboard[currentUserIndex], rank: currentUserIndex + 1 };
      
      // Get users around the current user
      const start = Math.max(0, currentUserIndex - 2);
      const end = Math.min(sortedLeaderboard.length, currentUserIndex + 3);
      usersAroundMe = sortedLeaderboard.slice(start, end).map((p, index) => ({
        ...p, 
        rank: start + index + 1
      }));
    }

    return NextResponse.json({
      leaderboard: sortedLeaderboard.map((p, index) => ({...p, rank: index + 1})),
      userRank,
      usersAroundMe,
    });
  } catch (error: any) {
    console.error("API Leaderboard GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
