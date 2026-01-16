export type StudySession = {
  date: string;
  duration: number; // minutes
  xpEarned: number;
  distractions: number;
  focusScore: number; // 0-100
};

export type SubjectProgress = {
  name: string;
  color: string;
  completed: number;
  total: number;
  completionPercent: number;
  estimatedHours: number;
  hoursSpent: number;
};

export type HourlyStats = {
  hour: number; // 0-23
  sessionsCount: number;
  totalMinutes: number;
  avgFocusScore: number;
};

export type DistractionStats = {
  type: string;
  count: number;
  percentage: number;
};

export type AnalyticsData = {
  totalStudyHours: number;
  totalSessions: number;
  averageFocusScore: number;
  totalXPEarned: number;
  bestStudyHour: number;
  currentStreak: number;
  completionRate: number;
  studySessions: StudySession[];
  subjectProgress: SubjectProgress[];
  hourlyStats: HourlyStats[];
  distractionStats: DistractionStats[];
};