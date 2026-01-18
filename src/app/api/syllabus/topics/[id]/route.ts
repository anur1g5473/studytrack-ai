import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates = await request.json();

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid topic ID." }, { status: 400 });
    }

    // Input Validation for updates
    if (updates.name && (typeof updates.name !== "string" || updates.name.trim().length < 3 || updates.name.trim().length > 100)) {
      return NextResponse.json({ error: "Topic name must be between 3 and 100 characters." }, { status: 400 });
    }
    if (updates.difficulty && (typeof updates.difficulty !== "string" || !["easy", "medium", "hard"].includes(updates.difficulty))) {
        return NextResponse.json({ error: "Invalid difficulty level." }, { status: 400 });
    }
    if (updates.estimated_minutes && (typeof updates.estimated_minutes !== "number" || updates.estimated_minutes <= 0 || updates.estimated_minutes > 300)) {
        return NextResponse.json({ error: "Estimated minutes must be a positive number up to 300." }, { status: 400 });
    }
    
    // Ensure user_id or chapter_id cannot be updated to arbitrary values
    if (updates.user_id && updates.user_id !== user.id) {
        return NextResponse.json({ error: "Cannot reassign topic ownership." }, { status: 403 });
    }
    if (updates.chapter_id) {
        // Verify the new chapter_id belongs to the user or is null
        const { data: chapter, error: chapterError } = await supabase
            .from("chapters")
            .select("id")
            .eq("id", updates.chapter_id)
            .eq("user_id", user.id)
            .single();
        if (chapterError || !chapter) {
            return NextResponse.json({ error: "Invalid chapter ID provided for topic." }, { status: 403 });
        }
    }

    const { data: updatedTopic, error } = await supabase
      .from("topics")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id) // RLS check for defense-in-depth
      .select()
      .single();

    if (error) {
      console.error("Error updating topic:", error);
      return NextResponse.json({ error: "Failed to update topic." }, { status: 500 });
    }

    return NextResponse.json(updatedTopic);
  } catch (error: any) {
    console.error("API Syllabus Topics PUT Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid topic ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // RLS check for defense-in-depth

    if (error) {
      console.error("Error deleting topic:", error);
      return NextResponse.json({ error: "Failed to delete topic." }, { status: 500 });
    }

    return NextResponse.json({ message: "Topic deleted successfully." });
  } catch (error: any) {
    console.error("API Syllabus Topics DELETE Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
