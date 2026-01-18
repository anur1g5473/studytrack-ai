import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Profile } from "@/types/database.types"; // Assuming Profile type is defined here

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates: Partial<Profile> = await request.json();

    // Define allowed updatable fields and perform validation
    const allowedUpdates: Partial<Profile> = {};
    const allowedFields = ["full_name", "avatar_url", "mission_goal", "exam_date", "daily_study_hours"];

    for (const field of allowedFields) {
      if (field in updates) {
        // Basic type checking - expand with more specific validation as needed
        if (field === "full_name" && (typeof updates[field] !== "string" || updates[field].trim().length < 2 || updates[field].trim().length > 100)) {
          return NextResponse.json({ error: "Full name must be between 2 and 100 characters." }, { status: 400 });
        }
        if (field === "avatar_url" && (typeof updates[field] !== "string" && updates[field] !== null)) {
            // Add more robust URL validation if necessary
            return NextResponse.json({ error: "Invalid avatar URL." }, { status: 400 });
        }
        if (field === "mission_goal" && (typeof updates[field] !== "string" || updates[field].trim().length < 5 || updates[field].trim().length > 200)) {
            return NextResponse.json({ error: "Mission goal must be between 5 and 200 characters." }, { status: 400 });
        }
        if (field === "exam_date" && (typeof updates[field] !== "string" && updates[field] !== null)) {
            // Basic date string format check, more robust validation can be added
            return NextResponse.json({ error: "Invalid exam date format." }, { status: 400 });
        }
        if (field === "daily_study_hours" && (typeof updates[field] !== "number" || updates[field] < 0.5 || updates[field] > 24)) {
            return NextResponse.json({ error: "Daily study hours must be between 0.5 and 24." }, { status: 400 });
        }

        allowedUpdates[field as keyof Profile] = updates[field as keyof Profile];
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(allowedUpdates)
      .eq("id", user.id) // Ensure user updates their own profile
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error("API Profile Settings PUT Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
