import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ChatMessage } from "@/types/chat.types";

// Basic sanitization function (re-used from other AI components for consistency)
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
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (typeof sessionId !== "string" || sessionId.trim() === "") {
      return NextResponse.json({ error: "Session ID is required to fetch messages." }, { status: 400 });
    }

    const { data: chatMessages, error: fetchError } = await supabase
      .from("chat_messages")
      .select("id, session_id, role, content, created_at")
      .eq("session_id", sessionId)
      .eq("user_id", user.id) // Enforce RLS via backend for defense-in-depth
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching chat messages:", fetchError);
      return NextResponse.json({ error: "Failed to fetch chat messages." }, { status: 500 });
    }

    return NextResponse.json(chatMessages);
  } catch (error: any) {
    console.error("API Chat Messages GET Error:", error?.message);
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
    const { sessionId, role, content } = await request.json();

    // Input Validation
    if (typeof sessionId !== "string" || sessionId.trim() === "") {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }
    if (typeof role !== "string" || !["user", "ai"].includes(role)) {
      return NextResponse.json({ error: "Invalid message role." }, { status: 400 });
    }
    if (typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Message content cannot be empty." }, { status: 400 });
    }
    if (content.length > 2000) { // Example length limit
      return NextResponse.json({ error: "Message content is too long." }, { status: 400 });
    }

    // Sanitize message content for storage
    const sanitizedContent = sanitizeInput(content); // Apply sanitization

    // Verify session_id belongs to the user if RLS is not fully trusted for INSERT
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: "Chat session not found or does not belong to the user." }, { status: 403 });
    }

    const { data: newMessage, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role,
        content: sanitizedContent,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat message:", error);
      return NextResponse.json({ error: "Failed to create chat message." }, { status: 500 });
    }

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.error("API Chat Messages POST Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
