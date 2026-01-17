import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchAIContext, formatContextForAI } from "@/lib/ai-context";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Debug log (remove after fixing)
if (typeof window !== "undefined") {
  console.log("Gemini API Key exists:", !!apiKey);
  console.log("API Key prefix:", apiKey?.substring(0, 10) + "...");
}

export async function generateResponse(
  userMessage: string,
  userId: string
): Promise<string> {
  if (!apiKey) {
    console.error("API Key is missing!");
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.startsWith("NEXT_PUBLIC")));
    return "⚠️ API Key Missing! Add NEXT_PUBLIC_GEMINI_API_KEY to environment variables and redeploy.";
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
      return "⏳ AI quota exceeded. Please wait a minute and try again.";
    }

    return `❌ Error: ${error?.message || "Unknown error"}`;
  }
}
export async function generateFlashcards(
  topic: string,
  count: number = 5
): Promise<{ front: string; back: string }[]> {
  if (!apiKey) {
    throw new Error("API Key missing");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Create ${count} study flashcards about "${topic}".
      Return ONLY a raw JSON array. Do not wrap in markdown code blocks.
      Format:
      [
        { "front": "Question or Term", "back": "Answer or Definition" }
      ]
      Make the questions concise and the answers clear.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up if the AI wraps in ```json ... ```
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to generate cards:", error);
    return [];
  }
}