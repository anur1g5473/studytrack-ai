import { createClient } from "@/lib/supabase/client";
import type { ScheduleTask } from "@/types/planner.types";

const supabase = createClient();

// Fetch schedule for a date range
export async function fetchSchedule(userId: string, startDate: string, endDate: string) {
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
    .eq("user_id", userId)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date");

  if (error) throw error;

  // Flatten the nested structure for easier use
  return data.map((task: any) => ({
    ...task,
    topic: {
      ...task.topic,
      subject: task.topic?.chapter?.subject
    }
  })) as ScheduleTask[];
}

// Create multiple tasks
export async function createScheduleTasks(tasks: { user_id: string; topic_id: string; scheduled_date: string }[]) {
  const { data, error } = await supabase
    .from("schedule_tasks")
    .insert(tasks)
    .select();

  if (error) throw error;
  return data;
}

// Clear schedule for range (re-planning)
export async function clearSchedule(userId: string, startDate: string, endDate: string) {
  const { error } = await supabase
    .from("schedule_tasks")
    .delete()
    .eq("user_id", userId)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .eq("is_completed", false); // Only delete uncompleted tasks

  if (error) throw error;
}

// Toggle task completion
export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  const { error } = await supabase
    .from("schedule_tasks")
    .update({ is_completed: isCompleted })
    .eq("id", taskId);

  if (error) throw error;
}

// Fetch unscheduled topics (Backlog)
export async function fetchUnscheduledTopics(userId: string) {
  // 1. Get all topics
  const { data: allTopics } = await supabase
    .from("topics")
    .select("*, chapter:chapters(subject:subjects(name, color))")
    .eq("user_id", userId)
    .eq("status", "not_started");

  // 2. Get all scheduled task topic_ids
  const { data: scheduled } = await supabase
    .from("schedule_tasks")
    .select("topic_id")
    .eq("user_id", userId);

  const scheduledIds = new Set(scheduled?.map(s => s.topic_id));

  // 3. Filter
  return (allTopics || [])
    .filter(t => !scheduledIds.has(t.id))
    .map((t: any) => ({
      ...t,
      subject: t.chapter?.subject
    }));
}