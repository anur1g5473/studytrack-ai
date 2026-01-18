import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AIContext } from "@/lib/ai-context";

const apiKey = process.env.GEMINI_API_KEY; // Use server-side only key

if (!apiKey) {
  console.error("Server-side Gemini API Key is missing!");
  // In a real app, you might want to throw an error or handle this more gracefully
}

// Basic input sanitization to mitigate prompt injection
function sanitizeInput(input: string): string {
  // Remove potentially harmful markdown or special characters that could break the prompt structure
  // This is a basic example; for production, consider a more comprehensive library or approach
  let sanitized = input.replace(/\`\`\`/g, ""); // Remove triple backticks
  sanitized = sanitized.replace(/\`\`/g, "");   // Remove double backticks
  sanitized = sanitized.replace(/\`/g, "");     // Remove single backticks
  sanitized = sanitized.replace(/[<>&]/g, (match) => {
    if (match === ">") return "&gt;";
    if (match === "<") return "&lt;";
    if (match === "&") return "&amp;";
    return match; // Should not happen
  });
  // Add more sanitization rules as needed based on the AI model's vulnerabilities
  return sanitized.trim();
}

// Server-side AI context fetching using server-side Supabase client
async function fetchAIContext(userId: string): Promise<AIContext> {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  try {
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (profileError) throw profileError;

    // Fetch subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .order("order_index");
    if (subjectsError) throw subjectsError;

    // Fetch all chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from("chapters")
      .select("*")
      .eq("user_id", userId)
      .order("order_index");
    if (chaptersError) throw chaptersError;

    // Fetch all topics
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .eq("user_id", userId)
      .order("order_index");
    if (topicsError) throw topicsError;

    // Fetch recent focus sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: sessions, error: sessionsError } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);
    if (sessionsError) throw sessionsError;

    // Process syllabus data
    const subjectsList = (subjects || []).map((subject) => {
      const subjectChapters = (chapters || []).filter(
        (c) => c.subject_id === subject.id
      );

      return {
        name: subject.name,
        color: subject.color,
        chapters: subjectChapters.map((chapter) => {
          const chapterTopics = (topics || []).filter(
            (t) => t.chapter_id === chapter.id
          );

          return {
            name: chapter.name,
            topics: chapterTopics.map((topic) => ({
              name: topic.name,
              status: topic.status,
              difficulty: topic.difficulty,
              estimatedMinutes: topic.estimated_minutes,
            })),
          };
        }),
      };
    });

    // Calculate stats
    const allTopics = topics || [];
    const completedTopics = allTopics.filter((t) => t.status === "completed");
    const inProgressTopics = allTopics.filter((t) => t.status === "in_progress");

    // Identify weak topics (hard + not completed)
    const weakTopics = allTopics
      .filter((t) => t.difficulty === "hard" && t.status !== "completed")
      .slice(0, 5)
      .map((t) => t.name);

    // Identify strong topics (completed + easy/medium)
    const strongTopics = allTopics
      .filter((t) => t.status === "completed")
      .slice(0, 5)
      .map((t) => t.name);

    // Process sessions
    const recentSessions = (sessions || []).map((s) => ({
      date: s.created_at,
      durationMinutes: s.duration_minutes,
      xpEarned: s.xp_earned,
      distractionCount: s.distraction_count,
      completed: s.completed,
    }));

    const totalStudyMinutes = recentSessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0
    );

    return {
      user: {
        name: profile?.full_name || "Student",
        missionGoal: profile?.mission_goal || "General Study",
        examDate: profile?.exam_date || null,
        dailyStudyHours: profile?.daily_study_hours || 4,
        xpPoints: profile?.xp_points || 0,
        currentLevel: profile?.current_level || 1,
        streakDays: profile?.streak_days || 0,
      },
      syllabus: {
        totalSubjects: subjects?.length || 0,
        totalChapters: chapters?.length || 0,
        totalTopics: allTopics.length,
        completedTopics: completedTopics.length,
        inProgressTopics: inProgressTopics.length,
        completionPercent:
          allTopics.length > 0
            ? Math.round((completedTopics.length / allTopics.length) * 100)
            : 0,
        subjects: subjectsList,
      },
      recentSessions,
      analytics: {
        totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
        totalSessions: recentSessions.length,
        averageSessionLength:
          recentSessions.length > 0
            ? Math.round(totalStudyMinutes / recentSessions.length)
            : 0,
        mostProductiveHour: 10, // Default, can be calculated from sessions
        weakTopics,
        strongTopics,
      },
    };
  } catch (error: any) {
    console.error("Error fetching AI context:", error.message);
    throw error;
  }
}

// Format context for AI prompt
function formatContextForAI(context: AIContext): string {
  const { user, syllabus, recentSessions, analytics } = context;

  // Calculate days until exam
  let daysUntilExam = "Not set";
  if (user.examDate) {
    const examDate = new Date(user.examDate);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysUntilExam = diffDays > 0 ? `${diffDays} days` : "Passed";
  }

  // Build subjects summary
  let subjectsSummary = "";
  syllabus.subjects.forEach((subject) => {
    const totalTopics = subject.chapters.reduce(
      (sum, ch) => sum + ch.topics.length,
      0
    );
    const completedTopics = subject.chapters.reduce(
      (sum, ch) => sum + ch.topics.filter((t) => t.status === "completed").length,
      0
    );
    const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    subjectsSummary += `\n  - ${subject.name}: ${completedTopics}/${totalTopics} topics (${percent}% complete)`;

    subject.chapters.forEach((chapter) => {
      const chapterComplete = chapter.topics.filter(
        (t) => t.status === "completed"
      ).length;
      subjectsSummary += `\n    • ${chapter.name}: ${chapterComplete}/${chapter.topics.length} topics`;
    });
  });

  // Build weak topics list
  const weakTopicsList =
    analytics.weakTopics.length > 0
      ? analytics.weakTopics.join(", ")
      : "None identified yet";

  // Build recent activity
  let recentActivity = "";
  if (recentSessions.length > 0) {
    recentActivity = recentSessions
      .slice(0, 5)
      .map(
        (s) =>
          `${new Date(s.date).toLocaleDateString()}: ${s.durationMinutes}min, ${s.xpEarned} XP`
      )
      .join("\n  ");
  } else {
    recentActivity = "No recent sessions";
  }

  return `
=== STUDENT PROFILE ===
Name: ${user.name}
Mission Goal: ${user.missionGoal}
Exam Date: ${user.examDate || "Not set"} (${daysUntilExam} remaining)
Daily Study Target: ${user.dailyStudyHours} hours
Current Level: ${user.currentLevel}
XP Points: ${user.xpPoints}
Study Streak: ${user.streakDays} days

=== SYLLABUS OVERVIEW ===
Total Subjects: ${syllabus.totalSubjects}
Total Chapters: ${syllabus.totalChapters}
Total Topics: ${syllabus.totalTopics}
Completed: ${syllabus.completedTopics} (${syllabus.completionPercent}%)
In Progress: ${syllabus.inProgressTopics}
Not Started: ${syllabus.totalTopics - syllabus.completedTopics - syllabus.inProgressTopics}

=== SUBJECTS DETAIL ===${subjectsSummary || "\n  No subjects added yet"}

=== WEAK AREAS (Need Attention) ===
${weakTopicsList}

=== RECENT STUDY ACTIVITY (Last 7 Days) ===
Total Hours: ${analytics.totalStudyHours}
Total Sessions: ${analytics.totalSessions}
Avg Session: ${analytics.averageSessionLength} minutes

Recent Sessions:
  ${recentActivity}
`;
}

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured on server." }, { status: 500 });
  }

  try {
    const { type, payload } = await request.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    if (type === "generateResponse") {
      const { userMessage, userId } = payload;

      // Verify user authentication
      const cookieStore = cookies();
      const supabase = await createServerClient(cookieStore);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user || user.id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Fetch user's complete data using server-side Supabase client
      const context = await fetchAIContext(userId);
      const contextString = formatContextForAI(context);

      const sanitizedUserMessage = sanitizeInput(userMessage); // Apply sanitization

      const prompt = `You are StudyTrack.AI's intelligent Study Advisor. You have COMPLETE access to the student's data below.\r\n\r\n${contextString}\r\n\r\n=== YOUR CAPABILITIES ===\r\n1. KNOW everything about their syllabus, subjects, chapters, topics\r\n2. TRACK their progress and identify weak areas\r\n3. SUGGEST what to study next based on priorities\r\n4. CREATE personalized study plans\r\n5. MOTIVATE and encourage them\r\n6. EXPLAIN concepts if asked\r\n7. ANALYZE their study patterns\r\n\r\n=== RESPONSE RULES ===\r\n- Be concise (2-4 sentences unless they ask for detailed plan)\r\n- Use emojis occasionally 🎯\r\n- Reference their ACTUAL data (subjects, progress, etc.)\r\n- Give SPECIFIC, actionable advice\r\n- If they ask about subjects, list their REAL subjects\r\n- If they ask for a plan, use their REAL topics\r\n- Be encouraging but honest about areas needing work\r\n\r\n=== STUDENT'S QUESTION ===\r\n${sanitizedUserMessage}\r\n\r\n=== YOUR RESPONSE ===`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return NextResponse.json({ response: text });
    } else if (type === "generateFlashcards") {
      const { topic, count } = payload;

      const sanitizedTopic = sanitizeInput(topic); // Apply sanitization

      const prompt = `\r\n        Create ${count} study flashcards about "${sanitizedTopic}".\r\n        Return ONLY a raw JSON array. Do not wrap in markdown code blocks.\r\n        Format:\r\n        [\r\n          { "front": "Question or Term", "back": "Answer or Definition" }\r\n        ]\r\n        Make the questions concise and the answers clear.\r\n      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return NextResponse.json({ response: JSON.parse(cleanedText) });
    } else {
      return NextResponse.json({ error: "Invalid AI request type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Gemini API Route Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred with the AI service." }, { status: 500 });
  }
}
