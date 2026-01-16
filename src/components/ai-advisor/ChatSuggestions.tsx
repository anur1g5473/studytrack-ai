"use client";

import { motion } from "framer-motion";

const suggestions = [
  {
    title: "📚 My Subjects",
    query: "What subjects do I have and what's my progress?",
  },
  {
    title: "🎯 What to Study",
    query: "What should I study today based on my progress?",
  },
  {
    title: "📅 Weekly Plan",
    query: "Create a detailed study plan for this week",
  },
  {
    title: "⚠️ Weak Areas",
    query: "What are my weak topics that need more attention?",
  },
  {
    title: "💪 Motivation",
    query: "Give me some motivation to study today",
  },
  {
    title: "📈 My Progress",
    query: "Analyze my overall progress and give feedback",
  },
];

type ChatSuggestionsProps = {
  onSelect: (suggestion: string) => void;
};

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-sm text-gray-400 mb-4 text-center">
        Try asking one of these:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {suggestions.map((item, idx) => (
          <motion.button
            key={item.title}
            onClick={() => onSelect(item.query)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-gray-800 transition-all text-left group"
          >
            <p className="font-medium text-white text-sm group-hover:text-indigo-300 transition-colors">
              {item.title}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}