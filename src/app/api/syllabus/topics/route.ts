import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Topic } from "@/types/database.types"; // Assuming Topic type is defined here

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (typeof chapterId !== "string" || chapterId.trim() === "") {
      return NextResponse.json({ error: "Chapter ID is required to fetch topics." }, { status: 400 });
    }

    const { data: topics, error: fetchError } = await supabase
      .from("topics")
      .select("id, name, difficulty, estimated_minutes, chapter_id, created_at")
      .eq("chapter_id", chapterId)
      .eq("user_id", user.id) // RLS check for defense-in-depth
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching topics:", fetchError);
      return NextResponse.json({ error: "Failed to fetch topics." }, { status: 500 });
    }

    return NextResponse.json(topics);
  } catch (error: any) {
    console.error("API Syllabus Topics GET Error:", error?.message);
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
    const { name, chapterId, difficulty, estimatedMinutes } = await request.json();

    // Input Validation
    if (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100) {
      return NextResponse.json({ error: "Topic name must be between 3 and 100 characters." }, { status: 400 });
    }
    if (typeof chapterId !== "string" || chapterId.trim() === "") {
      return NextResponse.json({ error: "Chapter ID is required." }, { status: 400 });
    }
    if (typeof difficulty !== "string" || !["easy", "medium", "hard"].includes(difficulty)) {
        return NextResponse.json({ error: "Invalid difficulty level." }, { status: 400 });
    }
    if (typeof estimatedMinutes !== "number" || estimatedMinutes <= 0 || estimatedMinutes > 300) { // Example limit
        return NextResponse.json({ error: "Estimated minutes must be a positive number up to 300." }, { status: 400 });
    }

    // Optional: Verify chapterId belongs to the user if RLS is not fully trusted for INSERT
    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .select("id")
      .eq("id", chapterId)
      .eq("user_id", user.id)
      .single();
    
    if (chapterError || !chapter) {
      return NextResponse.json({ error: "Chapter not found or does not belong to the user." }, { status: 403 });
    }

    const { data: newTopic, error } = await supabase
      .from("topics")
      .insert({
        name: name.trim(),
        chapter_id: chapterId,
        user_id: user.id,
        difficulty,
        estimated_minutes: estimatedMinutes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating topic:", error);
      return NextResponse.json({ error: "Failed to create topic." }, { status: 500 });
    }

    return NextResponse.json(newTopic);
  } catch (error: any) {
    console.error("API Syllabus Topics POST Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
