import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ChatSession } from "@/types/chat.types";

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
      return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
    }

    const { data: chatSession, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, user_id, title, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .single();

    if (fetchError) {
      console.error("Error fetching chat session:", fetchError);
      return NextResponse.json({ error: "Failed to fetch chat session." }, { status: 500 });
    }

    return NextResponse.json(chatSession);
  } catch (error: any) {
    console.error("API Chat Session GET Error:", error?.message);
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
    const updates: Partial<ChatSession> = await request.json();

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
    }

    // Define allowed updatable fields and perform validation
    const allowedUpdates: Partial<ChatSession> = {};
    const allowedFields = ["title"];

    for (const field of allowedFields) {
      if (field in updates) {
        if (field === "title" && (typeof updates[field] !== "string" || updates[field].trim().length === 0 || updates[field].trim().length > 100)) {
          return NextResponse.json({ error: "Chat session title must be between 1 and 100 characters." }, { status: 400 });
        }
        allowedUpdates[field as keyof ChatSession] = updates[field as keyof ChatSession];
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    const { data: updatedSession, error } = await supabase
      .from("chat_sessions")
      .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the session
      .select()
      .single();

    if (error) {
      console.error("Error updating chat session:", error);
      return NextResponse.json({ error: "Failed to update chat session." }, { status: 500 });
    }

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    console.error("API Chat Session PUT Error:", error?.message);
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
      return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the session

    if (error) {
      console.error("Error deleting chat session:", error);
      return NextResponse.json({ error: "Failed to delete chat session." }, { status: 500 });
    }

    return NextResponse.json({ message: "Chat session deleted successfully." });
  } catch (error: any) {
    console.error("API Chat Session DELETE Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
