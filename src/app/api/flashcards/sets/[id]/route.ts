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
    if (match === ">") return "&gt";
    if (match === "<") return "&lt";
    if (match === "&") return "&amp";
    return match; // Should not happen
  });
  return sanitized.trim();
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid flashcard set ID." }, { status: 400 });
    }

    const { data: flashcardSet, error: fetchError } = await supabase
      .from("flashcard_sets")
      .select("id, user_id, title, description, topic_id, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .single();

    if (fetchError) {
      console.error("Error fetching flashcard set:", fetchError);
      return NextResponse.json({ error: "Failed to fetch flashcard set." }, { status: 500 });
    }

    return NextResponse.json(flashcardSet);
  } catch (error: any) {
    console.error("API Flashcard Set GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates: Partial<FlashcardSet> = await request.json();

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid flashcard set ID." }, { status: 400 });
    }

    // Define allowed updatable fields and perform validation
    const allowedUpdates: Partial<FlashcardSet> = {};
    const allowedFields = ["title", "description", "topic_id"];

    for (const field of allowedFields) {
      if (field in updates) {
        if (field === "title" && (typeof updates[field] !== "string" || updates[field].trim().length < 3 || updates[field].trim().length > 200)) {
          return NextResponse.json({ error: "Title must be between 3 and 200 characters." }, { status: 400 });
        }
        if (field === "description" && (typeof updates[field] !== "string" || updates[field].trim().length > 1000)) {
          return NextResponse.json({ error: "Description must be 1000 characters or less." }, { status: 400 });
        }
        if (field === "topic_id" && (typeof updates[field] !== "string" && updates[field] !== null)) {
          return NextResponse.json({ error: "Invalid topic ID." }, { status: 400 });
        }

        // Sanitize string inputs
        const fieldValue = (updates as any)[field];
        if (typeof fieldValue === "string") {
          allowedUpdates[field as keyof FlashcardSet] = sanitizeInput(fieldValue) as any;
        } else {
          allowedUpdates[field as keyof FlashcardSet] = fieldValue;
        }
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    // Optional: Verify topicId belongs to the user if RLS is not fully trusted for UPDATE
    if (allowedUpdates.topic_id) {
        const { data: topic, error: topicError } = await supabase
            .from("topics")
            .select("id")
            .eq("id", allowedUpdates.topic_id)
            .eq("user_id", user.id)
            .single();
        if (topicError || !topic) {
            return NextResponse.json({ error: "Topic not found or does not belong to the user." }, { status: 403 });
        }
    }

    const { data: updatedSet, error } = await supabase
      .from("flashcard_sets")
      .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the set
      .select()
      .single();

    if (error) {
      console.error("Error updating flashcard set:", error);
      return NextResponse.json({ error: "Failed to update flashcard set." }, { status: 500 });
    }

    return NextResponse.json(updatedSet);
  } catch (error: any) {
    console.error("API Flashcard Set PUT Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid flashcard set ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("flashcard_sets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the set

    if (error) {
      console.error("Error deleting flashcard set:", error);
      return NextResponse.json({ error: "Failed to delete flashcard set." }, { status: 500 });
    }

    return NextResponse.json({ message: "Flashcard set deleted successfully." });
  } catch (error: any) {
    console.error("API Flashcard Set DELETE Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
