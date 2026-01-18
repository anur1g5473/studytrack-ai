import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Flashcard } from "@/types/flashcard.types";
import { SRS_ALGORITHMS } from "@/lib/srs-algorithm"; // Assuming SRS_ALGORITHMS is defined

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid flashcard ID." }, { status: 400 });
    }

    const { data: flashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id, set_id, front, back, difficulty, last_studied_at, next_review_at, repetitions, ease_factor, interval_days, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .single();

    if (fetchError) {
      console.error("Error fetching flashcard:", fetchError);
      return NextResponse.json({ error: "Failed to fetch flashcard." }, { status: 500 });
    }

    return NextResponse.json(flashcard);
  } catch (error: any) {
    console.error("API Flashcard GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const updates = await request.json();

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid flashcard ID." }, { status: 400 });
    }

    // Special handling for updateCardProgress
    if (updates.action === "updateProgress" && typeof updates.quality === "number") {
      const { data: currentCard, error: fetchError } = await supabase
        .from("flashcards")
        .select("repetitions, ease_factor, interval_days, last_studied_at")
        .eq("id", id)
        .eq("user_id", user.id) // Ownership check
        .single();

      if (fetchError || !currentCard) {
        console.error("Error fetching card for progress update:", fetchError);
        return NextResponse.json({ error: "Flashcard not found or not owned by user." }, { status: 404 });
      }

      const { repetitions, ease_factor, interval_days, next_review_at } = SRS_ALGORITHMS.sm2(currentCard, updates.quality);

      const { data: updatedCard, error } = await supabase
        .from("flashcards")
        .update({
          repetitions,
          ease_factor,
          interval_days,
          last_studied_at: new Date().toISOString(),
          next_review_at,
          difficulty: updates.quality < 3 ? "hard" : updates.quality < 4 ? "medium" : "easy", // Update difficulty based on quality
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id) // Final ownership check
        .select()
        .single();

      if (error) {
        console.error("Error updating flashcard progress:", error);
        return NextResponse.json({ error: "Failed to update flashcard progress." }, { status: 500 });
      }

      return NextResponse.json(updatedCard);
    }

    // General update for other fields
    const allowedUpdates: Partial<Flashcard> = {};
    const allowedFields = ["front", "back", "difficulty", "set_id"];

    for (const field of allowedFields) {
      if (field in updates) {
        if (field === "front" && (typeof updates[field] !== "string" || updates[field].trim().length < 1 || updates[field].trim().length > 500)) {
          return NextResponse.json({ error: "Front content must be between 1 and 500 characters." }, { status: 400 });
        }
        if (field === "back" && (typeof updates[field] !== "string" || updates[field].trim().length < 1 || updates[field].trim().length > 1000)) {
          return NextResponse.json({ error: "Back content must be between 1 and 1000 characters." }, { status: 400 });
        }
        if (field === "difficulty" && (typeof updates[field] !== "string" || !["easy", "medium", "hard"].includes(updates[field]))) {
            return NextResponse.json({ error: "Invalid difficulty level." }, { status: 400 });
        }
        if (field === "set_id" && (typeof updates[field] !== "string" || updates[field].trim() === "")) {
            return NextResponse.json({ error: "Invalid set ID." }, { status: 400 });
        }
        // Sanitize string inputs
        if (typeof updates[field] === "string") {
          allowedUpdates[field as keyof Flashcard] = sanitizeInput(updates[field] as string) as any;
        } else {
          allowedUpdates[field as keyof Flashcard] = updates[field as keyof Flashcard];
        }
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    // Verify set_id belongs to the user if RLS is not fully trusted for UPDATE
    if (allowedUpdates.set_id) {
        const { data: flashcardSet, error: setError } = await supabase
            .from("flashcard_sets")
            .select("id")
            .eq("id", allowedUpdates.set_id)
            .eq("user_id", user.id)
            .single();
        if (setError || !flashcardSet) {
            return NextResponse.json({ error: "Flashcard set not found or does not belong to the user." }, { status: 403 });
        }
    }

    const { data: updatedCard, error } = await supabase
      .from("flashcards")
      .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the card
      .select()
      .single();

    if (error) {
      console.error("Error updating flashcard:", error);
      return NextResponse.json({ error: "Failed to update flashcard." }, { status: 500 });
    }

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    console.error("API Flashcard PUT Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid flashcard ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the card

    if (error) {
      console.error("Error deleting flashcard:", error);
      return NextResponse.json({ error: "Failed to delete flashcard." }, { status: 500 });
    }

    return NextResponse.json({ message: "Flashcard deleted successfully." });
  } catch (error: any) {
    console.error("API Flashcard DELETE Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
