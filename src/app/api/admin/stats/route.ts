import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper to check admin status (re-using for consistency)
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return !error && profile?.is_admin === true;
}

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Access Denied: Insufficient Clearance Level." }, { status: 403 });
  }

  try {
    // Fetch total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (usersError) throw usersError;

    // Fetch active sessions (example: sessions completed today)
    const today = new Date().toISOString().split("T")[0];
    const { count: activeSessions, error: sessionsError } = await supabase
      .from("focus_sessions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today);
    if (sessionsError) throw sessionsError;

    // Fetch total subjects, chapters, topics (example, refine based on actual need)
    const { count: totalSubjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("id", { count: "exact", head: true });
    if (subjectsError) throw subjectsError;

    const { count: totalTopics, error: topicsError } = await supabase
      .from("topics")
      .select("id", { count: "exact", head: true });
    if (topicsError) throw topicsError;

    return NextResponse.json({
      totalUsers,
      activeSessions,
      totalSubjects,
      totalTopics,
    });
  } catch (error: any) {
    console.error("Admin Stats API Error:", error?.message);
    return NextResponse.json({ error: error?.message || "Failed to fetch admin statistics." }, { status: 500 });
  }
}
