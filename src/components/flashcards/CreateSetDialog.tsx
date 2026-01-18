"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Sparkles, Loader2 } from "lucide-react";
import { generateFlashcards } from "@/lib/gemini";
// import * as queries from "@/lib/supabase/flashcard-queries"; // Removed direct Supabase queries
import { useStore } from "@/store/useStore";

type CreateSetDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CreateSetDialog({ isOpen, onClose, onSuccess }: CreateSetDialogProps) {
  const { user } = useStore();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null); // Added error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic.trim()) return;

    setLoading(true);
    setStatus("Generating content with AI...");
    setError(null); // Clear previous errors

    try {
      // 1. Generate Cards using the Gemini API route
      const generatedCards = await generateFlashcards(topic, count);
      
      if (generatedCards.length === 0) {
        throw new Error("AI returned no cards. Please try a different topic.");
      }

      setStatus("Saving to database...");

      // 2. Create Set using the API route
      const createSetResponse = await fetch("/api/flashcards/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topic,
          description: `AI Generated set about ${topic}`,
          // topicId: // If linking to syllabus topics, add here
        }),
      });
      const newSet = await createSetResponse.json();

      if (!createSetResponse.ok) {
        throw new Error(newSet.error || "Failed to create flashcard set.");
      }

      // 3. Save Cards using the API route
      // Batching card creation for efficiency, though API route expects one by one for now.
      // A future enhancement could be a batch /api/flashcards/cards POST endpoint.
      const cardPromises = generatedCards.map((card) =>
        fetch("/api/flashcards/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setId: newSet.id,
            front: card.front,
            back: card.back,
          }),
        }).then(res => {
          if (!res.ok) return res.json().then(err => Promise.reject(err.error));
          return res.json();
        })
      );
      await Promise.all(cardPromises);

      setStatus("Done!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error creating set. Please try again.");
      setStatus("Error creating set.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">AI Flashcard Generator</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topic or Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Newton's Laws..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Cards: {count}
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              disabled={loading}
            />
          </div>

          {status && !error && (
            <p className="text-sm text-center text-indigo-300 animate-pulse">
              {status}
            </p>
          )}
          {error && (
            <p className="text-sm text-center text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full gap-2"
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Generating..." : "Generate Magic Cards"}
          </Button>
        </form>
      </div>
    </div>
  );
}
