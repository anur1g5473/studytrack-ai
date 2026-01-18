import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ChatSession } from "@/types/chat.types";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: chatSessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, user_id, title, created_at, updated_at")
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .order("updated_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching chat sessions:", fetchError);
      return NextResponse.json({ error: "Failed to fetch chat sessions." }, { status: 500 });
    }

    return NextResponse.json(chatSessions);
  } catch (error: any) {
    console.error("API Chat Sessions GET Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = await request.json();

    // Input Validation (title is optional, but if provided, validate length)
    if (title && (typeof title !== "string" || title.trim().length > 100)) {
      return NextResponse.json({ error: "Chat session title must be 100 characters or less." }, { status: 400 });
    }

    const { data: newSession, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        title: title || "New Chat Session",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat session:", error);
      return NextResponse.json({ error: "Failed to create chat session." }, { status: 500 });
    }

    return NextResponse.json(newSession);
  } catch (error: any) {
    console.error("API Chat Sessions POST Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
