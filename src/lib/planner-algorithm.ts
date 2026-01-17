import { createScheduleTasks, clearSchedule, fetchUnscheduledTopics } from "@/lib/supabase/planner-queries";

export async function generateWeeklyPlan(
  userId: string,
  startDate: Date,
  dailyHours: number
) {
  // 1. Calculate the week dates
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  // 2. Clear existing uncompleted schedule for this week
  await clearSchedule(userId, dates[0], dates[6]);

  // 3. Get unscheduled topics
  const topics = await fetchUnscheduledTopics(userId);
  
  if (topics.length === 0) return;

  // 4. Distribute topics
  const tasksToCreate = [];
  let topicIndex = 0;

  for (const date of dates) {
    let dayMinutes = 0;
    const maxMinutes = dailyHours * 60;

    // Fill the day until max hours reached
    while (dayMinutes < maxMinutes && topicIndex < topics.length) {
      const topic = topics[topicIndex];
      const estTime = topic.estimated_minutes || 30;

      // Add task
      tasksToCreate.push({
        user_id: userId,
        topic_id: topic.id,
        scheduled_date: date
      });

      dayMinutes += estTime;
      topicIndex++;
    }
  }

  // 5. Save to DB
  if (tasksToCreate.length > 0) {
    await createScheduleTasks(tasksToCreate);
  }

  return tasksToCreate.length;
}