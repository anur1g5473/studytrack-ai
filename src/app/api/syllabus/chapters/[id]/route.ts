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
      return NextResponse.json({ error: "Invalid chapter ID." }, { status: 400 });
    }

    // Input Validation for updates
    if (updates.name && (typeof updates.name !== "string" || updates.name.trim().length < 3 || updates.name.trim().length > 100)) {
      return NextResponse.json({ error: "Chapter name must be between 3 and 100 characters." }, { status: 400 });
    }
    
    // Ensure user_id or subject_id cannot be updated to arbitrary values
    if (updates.user_id && updates.user_id !== user.id) {
        return NextResponse.json({ error: "Cannot reassign chapter ownership." }, { status: 403 });
    }
    if (updates.subject_id) {
        // Verify the new subject_id belongs to the user or is null
        const { data: subject, error: subjectError } = await supabase
            .from("subjects")
            .select("id")
            .eq("id", updates.subject_id)
            .eq("user_id", user.id)
            .single();
        if (subjectError || !subject) {
            return NextResponse.json({ error: "Invalid subject ID provided for chapter." }, { status: 403 });
        }
    }

    const { data: updatedChapter, error } = await supabase
      .from("chapters")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id) // RLS check for defense-in-depth
      .select()
      .single();

    if (error) {
      console.error("Error updating chapter:", error);
      return NextResponse.json({ error: "Failed to update chapter." }, { status: 500 });
    }

    return NextResponse.json(updatedChapter);
  } catch (error: any) {
    console.error("API Syllabus Chapters PUT Error:", error?.message);
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
      return NextResponse.json({ error: "Invalid chapter ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // RLS check for defense-in-depth

    if (error) {
      console.error("Error deleting chapter:", error);
      return NextResponse.json({ error: "Failed to delete chapter." }, { status: 500 });
    }

    return NextResponse.json({ message: "Chapter deleted successfully." });
  } catch (error: any) {
    console.error("API Syllabus Chapters DELETE Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
