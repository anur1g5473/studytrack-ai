import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ScheduleTask } from "@/types/planner.types";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    if (userId && user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("schedule_tasks")
      .select(`
        *,
        topic:topics (
          *,
          chapter:chapters (
            subject:subjects (
              name,
              color
            )
          )
        )
      `)
      .eq("user_id", user.id)
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .order("scheduled_date");

    if (error) {
      console.error("Error fetching schedule:", error);
      return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    }

    // Flatten the nested structure for easier use
    const flattenedData = (data || []).map((task: any) => ({
      ...task,
      topic: {
        ...task.topic,
        subject: task.topic?.chapter?.subject
      }
    })) as ScheduleTask[];

    return NextResponse.json(flattenedData);
  } catch (error: any) {
    console.error("Fetch schedule API error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tasks } = await request.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: "Tasks array is required" }, { status: 400 });
    }

    // Validate and sanitize tasks
    const validatedTasks = tasks.map((task: any) => {
      if (task.user_id !== user.id) {
        throw new Error("Forbidden: User ID mismatch");
      }
      if (!task.topic_id || typeof task.topic_id !== "string") {
        throw new Error("Invalid topic_id");
      }
      if (!task.scheduled_date || typeof task.scheduled_date !== "string") {
        throw new Error("Invalid scheduled_date");
      }
      return {
        user_id: user.id,
        topic_id: task.topic_id,
        scheduled_date: task.scheduled_date,
      };
    });

    const { data, error } = await supabase
      .from("schedule_tasks")
      .insert(validatedTasks)
      .select();

    if (error) {
      console.error("Error creating schedule tasks:", error);
      return NextResponse.json({ error: "Failed to create schedule tasks" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Create schedule tasks API error:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    if (userId && user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("schedule_tasks")
      .delete()
      .eq("user_id", user.id)
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .eq("is_completed", false); // Only delete uncompleted tasks

    if (error) {
      console.error("Error clearing schedule:", error);
      return NextResponse.json({ error: "Failed to clear schedule" }, { status: 500 });
    }

    return NextResponse.json({ message: "Schedule cleared successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Clear schedule API error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
