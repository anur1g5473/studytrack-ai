import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Chapter } from "@/types/database.types"; // Assuming Chapter type is defined here

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (typeof subjectId !== "string" || subjectId.trim() === "") {
      return NextResponse.json({ error: "Subject ID is required to fetch chapters." }, { status: 400 });
    }

    const { data: chapters, error: fetchError } = await supabase
      .from("chapters")
      .select("id, name, subject_id, created_at")
      .eq("subject_id", subjectId)
      .eq("user_id", user.id) // RLS check for defense-in-depth
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching chapters:", fetchError);
      return NextResponse.json({ error: "Failed to fetch chapters." }, { status: 500 });
    }

    return NextResponse.json(chapters);
  } catch (error: any) {
    console.error("API Syllabus Chapters GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, subjectId } = await request.json();

    // Input Validation
    if (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100) {
      return NextResponse.json({ error: "Chapter name must be between 3 and 100 characters." }, { status: 400 });
    }
    if (typeof subjectId !== "string" || subjectId.trim() === "") {
      return NextResponse.json({ error: "Subject ID is required." }, { status: 400 });
    }

    // Optional: Verify subjectId belongs to the user if RLS is not fully trusted for INSERT
    const { data: subject, error: subjectError } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", subjectId)
      .eq("user_id", user.id)
      .single();
    
    if (subjectError || !subject) {
      return NextResponse.json({ error: "Subject not found or does not belong to the user." }, { status: 403 });
    }

    const { data: newChapter, error } = await supabase
      .from("chapters")
      .insert({
        name: name.trim(),
        subject_id: subjectId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chapter:", error);
      return NextResponse.json({ error: "Failed to create chapter." }, { status: 500 });
    }

    return NextResponse.json(newChapter);
  } catch (error: any) {
    console.error("API Syllabus Chapters POST Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
