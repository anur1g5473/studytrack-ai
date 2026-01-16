import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchAIContext, formatContextForAI } from "@/lib/ai-context";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function generateResponse(
  userMessage: string,
  userId: string
): Promise<string> {
  if (!apiKey) {
    return "⚠️ API Key Missing! Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local";
  }

  try {
    // Fetch user's complete data
    const context = await fetchAIContext(userId);
    const contextString = formatContextForAI(context);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are StudyTrack.AI's intelligent Study Advisor. You have COMPLETE access to the student's data below.

${contextString}

=== YOUR CAPABILITIES ===
1. KNOW everything about their syllabus, subjects, chapters, topics
2. TRACK their progress and identify weak areas
3. SUGGEST what to study next based on priorities
4. CREATE personalized study plans
5. MOTIVATE and encourage them
6. EXPLAIN concepts if asked
7. ANALYZE their study patterns

=== RESPONSE RULES ===
- Be concise (2-4 sentences unless they ask for detailed plan)
- Use emojis occasionally 🎯
- Reference their ACTUAL data (subjects, progress, etc.)
- Give SPECIFIC, actionable advice
- If they ask about subjects, list their REAL subjects
- If they ask for a plan, use their REAL topics
- Be encouraging but honest about areas needing work

=== STUDENT'S QUESTION ===
${userMessage}

=== YOUR RESPONSE ===`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini Error:", error?.message);

    if (error?.message?.includes("quota") || error?.message?.includes("429")) {
      return "⏳ AI quota exceeded. Please wait a minute and try again, or check your Google Cloud billing.";
    }

    return `❌ Error: ${error?.message || "Unknown error"}`;
  }
}