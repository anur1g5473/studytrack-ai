import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { isCompleted } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json({ error: "isCompleted must be a boolean" }, { status: 400 });
    }

    // Verify task ownership before updating
    const { data: existingTask, error: fetchError } = await supabase
      .from("schedule_tasks")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("schedule_tasks")
      .update({ is_completed: isCompleted })
      .eq("id", id)
      .eq("user_id", user.id) // Double-check ownership
      .select()
      .single();

    if (error) {
      console.error("Error toggling task completion:", error);
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Toggle task completion API error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
