import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId && user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Get all topics
    const { data: allTopics, error: topicsError } = await supabase
      .from("topics")
      .select("*, chapter:chapters(subject:subjects(name, color))")
      .eq("user_id", user.id)
      .eq("status", "not_started");

    if (topicsError) {
      console.error("Error fetching topics:", topicsError);
      return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
    }

    // 2. Get all scheduled task topic_ids
    const { data: scheduled, error: scheduledError } = await supabase
      .from("schedule_tasks")
      .select("topic_id")
      .eq("user_id", user.id);

    if (scheduledError) {
      console.error("Error fetching scheduled tasks:", scheduledError);
      return NextResponse.json({ error: "Failed to fetch scheduled tasks" }, { status: 500 });
    }

    const scheduledIds = new Set(scheduled?.map(s => s.topic_id));

    // 3. Filter and format
    const unscheduledTopics = (allTopics || [])
      .filter(t => !scheduledIds.has(t.id))
      .map((t: any) => ({
        ...t,
        subject: t.chapter?.subject
      }));

    return NextResponse.json(unscheduledTopics);
  } catch (error: any) {
    console.error("Fetch unscheduled topics API error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
