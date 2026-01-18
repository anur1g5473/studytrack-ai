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
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Access Denied: Insufficient Clearance Level." }, { status: 403 });
  }

  try {
    const { data: recentActivity, error: activityError } = await supabase
      .from("focus_sessions")
      .select(`
        id,
        duration_minutes,
        mood_environment,
        created_at,
        profiles(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10); // Fetch last 10 activities

    if (activityError) throw activityError;

    return NextResponse.json(recentActivity);
  } catch (error: any) {
    console.error("Admin Activity API Error:", error?.message);
    return NextResponse.json({ error: error?.message || "Failed to fetch recent activity." }, { status: 500 });
  }
}
