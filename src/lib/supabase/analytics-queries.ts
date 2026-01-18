import { createClient } from "@/lib/supabase/client";
import type {
  AnalyticsData,
  StudySession,
  SubjectProgress,
  HourlyStats,
  DistractionStats,
} from "@/types/analytics.types";

// The client-side Supabase instance is no longer needed in this file.
// All analytics data fetching and processing now happens via the /api/analytics route.

// export async function fetchAnalyticsData (userId: string, daysBack: number = 30): Promise<AnalyticsData> { ... } -> Removed
// function processSessions(sessions: any[]): StudySession[] { ... } -> Removed
// async function processSubjectProgress(userId: string, subjects: any[]): Promise<SubjectProgress[]> { ... } -> Removed
// function processHourlyStats(sessions: any[]): HourlyStats[] { ... } -> Removed
// function processDistractionStats(sessions: any[]): DistractionStats[] { ... } -> Removed

// Only the types remain, and any functions that are still intended for client-side use
// (though for analytics, all heavy lifting is now server-side).

// Placeholder for any remaining client-side helper functions if necessary
// For now, this file will primarily serve to define types if they are not moved elsewhere.
