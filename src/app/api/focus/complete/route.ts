import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Distraction } from "@/types/focus.types";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, completed, elapsedMinutes, distractions } = await request.json();

    // 1. Server-side Input Validation for distractions
    if (!Array.isArray(distractions)) {
      return NextResponse.json({ error: "Invalid distractions format." }, { status: 400 });
    }
    for (const d of distractions) {
      if (typeof d.type !== "string" || typeof d.description !== "string" || typeof d.timestamp !== "string") {
        return NextResponse.json({ error: "Invalid distraction item format." }, { status: 400 });
      }
      // Add more specific validation for type/description content if needed
    }
    if (typeof elapsedMinutes !== "number" || elapsedMinutes < 0) {
        return NextResponse.json({ error: "Invalid elapsedMinutes." }, { status: 400 });
    }

    // 2. Server-side XP Calculation
    const xpEarned = completed ? elapsedMinutes * 10 : elapsedMinutes * 5; // Trusted server-side calculation

    // 3. Update session
    const { data: session, error: sessionError } = await supabase
      .from("focus_sessions")
      .update({
        completed,
        xp_earned: xpEarned,
        distraction_count: distractions.length,
        distractions,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id) // Crucial: ensure user owns the session
      .select()
      .single();

    if (sessionError) {
      console.error("Supabase session update error:", sessionError);
      return NextResponse.json({ error: "Failed to update session." }, { status: 500 });
    }

    // 4. Update user XP and level
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("xp_points, current_level")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Supabase profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
    }

    const newXp = profile.xp_points + xpEarned;
    const newLevel = Math.floor(newXp / 1000) + 1; // Assuming 1000 XP per level

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        xp_points: newXp,
        current_level: newLevel,
        last_study_date: new Date().toISOString(),
      })
      .eq("id", user.id); // Ensure user owns the profile

    if (updateProfileError) {
      console.error("Supabase profile update error:", updateProfileError);
      return NextResponse.json({ error: "Failed to update user profile." }, { status: 500 });
    }

    return NextResponse.json({ session, xpEarned, newLevel });
  } catch (error: any) {
    console.error("API Focus Complete Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
