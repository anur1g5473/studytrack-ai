import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatSession } from "@/types/chat.types";

const supabase = createClient();

// Create new chat session
export async function createChatSession(userId: string): Promise<ChatSession> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      title: "New Chat",
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChatSession;
}

// Get chat sessions
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as ChatSession[];
}

// Get messages for a session
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as ChatMessage[];
}

// Save message
export async function saveChatMessage(
  sessionId: string,
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChatMessage;
}

// Delete session
export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw error;
}