import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Subject } from "@/types/database.types"; // Assuming Subject type is defined here

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: subjects, error: fetchError } = await supabase
      .from("subjects")
      .select("id, name, color, user_id, created_at")
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching subjects:", fetchError);
      return NextResponse.json({ error: "Failed to fetch subjects." }, { status: 500 });
    }

    return NextResponse.json(subjects);
  } catch (error: any) {
    console.error("API Syllabus Subjects GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, color } = await request.json();

    // Input Validation
    if (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100) {
      return NextResponse.json({ error: "Subject name must be between 3 and 100 characters." }, { status: 400 });
    }
    // Basic color validation (e.g., check if it's a hex code or a predefined color name)
    if (typeof color !== "string" || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/.test(color)) {
        return NextResponse.json({ error: "Invalid color format." }, { status: 400 });
    }

    const { data: newSubject, error } = await supabase
      .from("subjects")
      .insert({
        name: name.trim(),
        color: color.trim(),
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subject:", error);
      return NextResponse.json({ error: "Failed to create subject." }, { status: 500 });
    }

    return NextResponse.json(newSubject);
  } catch (error: any) {
    console.error("API Syllabus Subjects POST Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
