"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatSuggestions } from "./ChatSuggestions";
import { generateResponse } from "@/lib/gemini";
// import * as chatQueries from "@/lib/supabase/chat-queries"; // Removed direct Supabase queries
import { Button } from "@/components/ui/Button";
import {
  MessageSquare,
  Plus,
  Trash2,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { ChatMessage as ChatMessageType, ChatSession } from "@/types/chat.types";

export function AIAdvisor() {
  const router = useRouter();
  const { user } = useStore();

  // State
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Create new session if none exists or load existing ones
        const createSessionResponse = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // Title can be empty for initial creation
        });
        const newSession = await createSessionResponse.json();

        if (createSessionResponse.ok) {
          setSessionId(newSession.id);
        } else {
          throw new Error(newSession.error || "Failed to create new chat session.");
        }

        const sessionsResponse = await fetch("/api/chat/sessions");
        const sessionsData = await sessionsResponse.json();

        if (sessionsResponse.ok) {
          setChatSessions(sessionsData);
        } else {
          throw new Error(sessionsData.error || "Failed to fetch chat sessions.");
        }

      } catch (error) {
        console.error("Failed to initialize chat:", error);
        // Optionally, show a user-friendly error message
      }
    };

    initChat();
  }, [user, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!sessionId || !user) return;

    try {
      setLoading(true);

      // Save user message
      const userMessageResponse = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, role: "user", content }),
      });
      const userMessage = await userMessageResponse.json();
      if (!userMessageResponse.ok) {
        throw new Error(userMessage.error || "Failed to save user message.");
      }
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      const aiResponseContent = await generateResponse(content, user.id);

      // Save AI message
      const assistantMessageResponse = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, role: "ai", content: aiResponseContent }),
      });
      const assistantMessage = await assistantMessageResponse.json();
      if (!assistantMessageResponse.ok) {
        throw new Error(assistantMessage.error || "Failed to save AI message.");
      }
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally, show a user-friendly error message
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;

    try {
      const createSessionResponse = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const newSession = await createSessionResponse.json();

      if (createSessionResponse.ok) {
        setSessionId(newSession.id);
        setMessages([]);
        setIsSidebarOpen(false);

        const sessionsResponse = await fetch("/api/chat/sessions");
        const sessionsData = await sessionsResponse.json();
        if (sessionsResponse.ok) {
          setChatSessions(sessionsData);
        } else {
          throw new Error(sessionsData.error || "Failed to fetch chat sessions.");
        }
      } else {
        throw new Error(newSession.error || "Failed to create new chat session.");
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
      // Optionally, show a user-friendly error message
    }
  };

  const handleLoadSession = async (sessionIdToLoad: string) => {
    try {
      setSessionId(sessionIdToLoad);
      const messagesResponse = await fetch(`/api/chat/messages?sessionId=${sessionIdToLoad}`);
      const chatMessages = await messagesResponse.json();

      if (messagesResponse.ok) {
        setMessages(chatMessages);
        setIsSidebarOpen(false);
      } else {
        throw new Error(chatMessages.error || "Failed to load chat messages.");
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      // Optionally, show a user-friendly error message
    }
  };

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    try {
      const deleteResponse = await fetch(`/api/chat/sessions/${sessionIdToDelete}`, {
        method: "DELETE",
      });

      const deleteResult = await deleteResponse.json();

      if (deleteResponse.ok) {
        const sessionsResponse = await fetch("/api/chat/sessions");
        const sessionsData = await sessionsResponse.json();
        if (sessionsResponse.ok) {
          setChatSessions(sessionsData);
        } else {
          throw new Error(sessionsData.error || "Failed to fetch chat sessions after deletion.");
        }

        if (sessionIdToDelete === sessionId) {
          handleNewChat();
        }
      } else {
        throw new Error(deleteResult.error || "Failed to delete session.");
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      // Optionally, show a user-friendly error message
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button onClick={() => router.push("/login")}>Login to Chat</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed md:relative w-72 h-full bg-gray-900 border-r border-gray-800 flex flex-col z-50"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Chat History</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 text-gray-400 hover:text-white md:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Button
                  onClick={handleNewChat}
                  variant="primary"
                  size="sm"
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
              </div>

              {/* Chat History List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatSessions.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No chat history yet
                  </p>
                ) : (
                  chatSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group p-3 rounded-xl cursor-pointer transition-all ${
                        sessionId === session.id
                          ? "bg-indigo-600/20 border border-indigo-500/50"
                          : "hover:bg-gray-800/50 border border-transparent"
                      }`}
                      onClick={() => handleLoadSession(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Back to Dashboard */}
              <div className="p-4 border-t border-gray-800">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">AI Study Advisor</h1>
                <p className="text-xs text-gray-500">
                  Powered by Gemini • Knows your syllabus
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleNewChat} variant="ghost" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center py-12"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Hey, {user.full_name?.split(" ")[0] || "there"}! 👋
                </h2>
                <p className="text-gray-400 mb-8 max-w-md text-center">
                  I'm your AI Study Advisor. I know your syllabus, progress, and weak
                  areas. Ask me anything about your studies!
                </p>
                <ChatSuggestions onSelect={handleSendMessage} />
              </motion.div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {/* Loading indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 mb-6"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-gray-800/80 border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-900/80 backdrop-blur-md border-t border-gray-800 p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSendMessage} isLoading={loading} />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask about your subjects, progress, weak areas, or request a study plan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
