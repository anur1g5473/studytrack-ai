import type { Topic } from "./database.types";

export type ScheduleTask = {
  id: string;
  user_id: string;
  topic_id: string;
  scheduled_date: string; // YYYY-MM-DD
  is_completed: boolean;
  topic?: Topic & {
    subject?: {
      color: string;
      name: string;
    };
  };
};

export type DayPlan = {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue...
  tasks: ScheduleTask[];
  totalMinutes: number;
};