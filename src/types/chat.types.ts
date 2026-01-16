export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export const CHAT_SUGGESTIONS = [
  {
    id: "plan-week",
    title: "Plan This Week",
    description: "Create an optimized study schedule",
    icon: "📅",
  },
  {
    id: "weak-areas",
    title: "Identify Weak Areas",
    description: "Find topics needing more focus",
    icon: "🎯",
  },
  {
    id: "explain-concept",
    title: "Explain Concept",
    description: "Get help understanding a topic",
    icon: "📚",
  },
  {
    id: "boost-motivation",
    title: "Motivation Boost",
    description: "Need some encouragement?",
    icon: "🔥",
  },
];