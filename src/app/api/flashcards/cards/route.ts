import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Flashcard } from "@/types/flashcard.types";

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

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get("setId");

    if (typeof setId !== "string" || setId.trim() === "") {
      return NextResponse.json({ error: "Flashcard set ID is required to fetch cards." }, { status: 400 });
    }

    const { data: flashcards, error: fetchError } = await supabase
      .from("flashcards")
      .select("id, set_id, front, back, difficulty, last_studied_at, next_review_at, repetitions, ease_factor, interval_days, created_at, updated_at")
      .eq("set_id", setId)
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching flashcards:", fetchError);
      return NextResponse.json({ error: "Failed to fetch flashcards." }, { status: 500 });
    }

    return NextResponse.json(flashcards);
  } catch (error: any) {
    console.error("API Flashcard Cards GET Error:", error?.message);
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
    const { setId, front, back } = await request.json();

    // Input Validation and Sanitization
    if (typeof setId !== "string" || setId.trim() === "") {
      return NextResponse.json({ error: "Flashcard set ID is required." }, { status: 400 });
    }
    if (typeof front !== "string" || front.trim().length < 1 || front.trim().length > 500) {
      return NextResponse.json({ error: "Front content must be between 1 and 500 characters." }, { status: 400 });
    }
    if (typeof back !== "string" || back.trim().length < 1 || back.trim().length > 1000) {
      return NextResponse.json({ error: "Back content must be between 1 and 1000 characters." }, { status: 400 });
    }
    const sanitizedFront = sanitizeInput(front);
    const sanitizedBack = sanitizeInput(back);

    // Verify setId belongs to the user if RLS is not fully trusted for INSERT
    const { data: flashcardSet, error: setError } = await supabase
        .from("flashcard_sets")
        .select("id")
        .eq("id", setId)
        .eq("user_id", user.id)
        .single();
    
    if (setError || !flashcardSet) {
        return NextResponse.json({ error: "Flashcard set not found or does not belong to the user." }, { status: 403 });
    }

    const { data: newCard, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: user.id,
        set_id: setId,
        front: sanitizedFront,
        back: sanitizedBack,
        // Initialize SRS fields
        difficulty: "new",
        repetitions: 0,
        ease_factor: 2.5,
        interval_days: 0,
        last_studied_at: null,
        next_review_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating flashcard:", error);
      return NextResponse.json({ error: "Failed to create flashcard." }, { status: 500 });
    }

    return NextResponse.json(newCard);
  } catch (error: any) {
    console.error("API Flashcard Cards POST Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
