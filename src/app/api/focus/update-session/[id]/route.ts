import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { FocusSession } from "@/types/focus.types";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates: Partial<FocusSession> = await request.json();

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
    }

    // Define allowed updatable fields and perform validation
    const allowedUpdates: Partial<FocusSession> = {};
    const allowedFields = ["duration_minutes", "mood_environment", "notes", "topic_id", "subject_id"];

    for (const field of allowedFields) {
      if (field in updates) {
        // Basic type checking - expand with more specific validation as needed
        if (field === "duration_minutes" && (typeof updates[field] !== "number" || updates[field] <= 0)) {
          return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
        }
        if (field === "mood_environment" && (typeof updates[field] !== "string" || updates[field].trim() === "")) {
            return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
        }
        if (field === "notes" && typeof updates[field] !== "string") {
            return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
        }
        if (field === "topic_id" && (typeof updates[field] !== "string" && updates[field] !== null)) {
            return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
        }
        if (field === "subject_id" && (typeof updates[field] !== "string" && updates[field] !== null)) {
            return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
        }
        // Prevent direct updates to sensitive fields like xp_earned, completed, distraction_count, distractions, user_id
        if (["xp_earned", "completed", "distraction_count", "distractions", "user_id"].includes(field)) {
            return NextResponse.json({ error: `Unauthorized attempt to update sensitive field: ${field}.` }, { status: 403 });
        }

        allowedUpdates[field as keyof FocusSession] = (updates as any)[field];
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    const { data: updatedSession, error } = await supabase
      .from("focus_sessions")
      .update(allowedUpdates)
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the session
      .select()
      .single();

    if (error) {
      console.error("Error updating focus session:", error);
      return NextResponse.json({ error: "Failed to update focus session." }, { status: 500 });
    }

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    console.error("API Focus Session Update Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
