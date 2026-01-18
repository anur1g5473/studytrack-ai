import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const updates = await request.json();

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid subject ID." }, { status: 400 });
    }

    // Input Validation for updates
    if (updates.name && (typeof updates.name !== "string" || updates.name.trim().length < 3 || updates.name.trim().length > 100)) {
      return NextResponse.json({ error: "Subject name must be between 3 and 100 characters." }, { status: 400 });
    }
    if (updates.color && (typeof updates.color !== "string" || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/.test(updates.color))) {
        return NextResponse.json({ error: "Invalid color format." }, { status: 400 });
    }
    
    // Ensure user_id cannot be updated
    if (updates.user_id && updates.user_id !== user.id) {
        return NextResponse.json({ error: "Cannot reassign subject ownership." }, { status: 403 });
    }

    const { data: updatedSubject, error } = await supabase
      .from("subjects")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id) // RLS check for defense-in-depth
      .select()
      .single();

    if (error) {
      console.error("Error updating subject:", error);
      return NextResponse.json({ error: "Failed to update subject." }, { status: 500 });
    }

    return NextResponse.json(updatedSubject);
  } catch (error: any) {
    console.error("API Syllabus Subjects PUT Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid subject ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // RLS check for defense-in-depth

    if (error) {
      console.error("Error deleting subject:", error);
      return NextResponse.json({ error: "Failed to delete subject." }, { status: 500 });
    }

    return NextResponse.json({ message: "Subject deleted successfully." });
  } catch (error: any) {
    console.error("API Syllabus Subjects DELETE Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
