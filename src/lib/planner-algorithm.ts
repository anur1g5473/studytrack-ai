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
  const clearResponse = await fetch(`/api/planner/schedule?userId=${userId}&startDate=${dates[0]}&endDate=${dates[6]}`, {
    method: "DELETE",
  });
  if (!clearResponse.ok) {
    const errorData = await clearResponse.json();
    throw new Error(errorData.error || "Failed to clear schedule");
  }

  // 3. Get unscheduled topics
  const topicsResponse = await fetch(`/api/planner/unscheduled-topics?userId=${userId}`);
  if (!topicsResponse.ok) {
    const errorData = await topicsResponse.json();
    throw new Error(errorData.error || "Failed to fetch unscheduled topics");
  }
  const topics = await topicsResponse.json();
  
  if (topics.length === 0) return 0;

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
    const createResponse = await fetch("/api/planner/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: tasksToCreate }),
    });
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.error || "Failed to create schedule tasks");
    }
  }

  return tasksToCreate.length;
}