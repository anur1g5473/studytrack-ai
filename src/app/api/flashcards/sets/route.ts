import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { FlashcardSet } from "@/types/flashcard.types";

// Basic sanitization function
function sanitizeInput(input: string): string {
  let sanitized = input.replace(/\`\`\`/g, ""); // Remove triple backticks
  sanitized = sanitized.replace(/\`\`/g, "");   // Remove double backticks
  sanitized = sanitized.replace(/\`/g, "");     // Remove single backticks
  sanitized = sanitized.replace(/[<>&]/g, (match) => {
    if (match === ">") return "&gt;";
    if (match === "<") return "&lt;";
    if (match === "&") return "&amp;";
    return match; // Should not happen
  });
  return sanitized.trim();
}

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: flashcardSets, error: fetchError } = await supabase
      .from("flashcard_sets")
      .select("id, user_id, title, description, topic_id, created_at, updated_at")
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching flashcard sets:", fetchError);
      return NextResponse.json({ error: "Failed to fetch flashcard sets." }, { status: 500 });
    }

    return NextResponse.json(flashcardSets);
  } catch (error: any) {
    console.error("API Flashcard Sets GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, topicId } = await request.json();

    // Input Validation and Sanitization
    if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 200) {
      return NextResponse.json({ error: "Title must be between 3 and 200 characters." }, { status: 400 });
    }
    const sanitizedTitle = sanitizeInput(title);

    let sanitizedDescription = null;
    if (description) {
      if (typeof description !== "string" || description.trim().length > 1000) {
        return NextResponse.json({ error: "Description must be 1000 characters or less." }, { status: 400 });
      }
      sanitizedDescription = sanitizeInput(description);
    }

    if (topicId && (typeof topicId !== "string" || topicId.trim() === "")) {
      return NextResponse.json({ error: "Invalid topic ID." }, { status: 400 });
    }

    // Optional: Verify topicId belongs to the user if RLS is not fully trusted for INSERT
    if (topicId) {
        const { data: topic, error: topicError } = await supabase
            .from("topics")
            .select("id")
            .eq("id", topicId)
            .eq("user_id", user.id)
            .single();
        if (topicError || !topic) {
            return NextResponse.json({ error: "Topic not found or does not belong to the user." }, { status: 403 });
        }
    }

    const { data: newSet, error } = await supabase
      .from("flashcard_sets")
      .insert({
        user_id: user.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        topic_id: topicId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating flashcard set:", error);
      return NextResponse.json({ error: "Failed to create flashcard set." }, { status: 500 });
    }

    return NextResponse.json(newSet);
  } catch (error: any) {
    console.error("API Flashcard Sets POST Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
