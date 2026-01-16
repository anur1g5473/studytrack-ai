"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

type AddTopicDialogProps = {
  isOpen: boolean;
  isLoading: boolean;
  chapterName: string;
  onSubmit: (name: string, difficulty: "easy" | "medium" | "hard", estimatedMinutes: number) => Promise<void>;
  onClose: () => void;
};

export function AddTopicDialog({
  isOpen,
  isLoading,
  chapterName,
  onSubmit,
  onClose,
}: AddTopicDialogProps) {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Topic name is required");
      return;
    }

    try {
      await onSubmit(name, difficulty, estimatedMinutes);
      setName("");
      setDifficulty("medium");
      setEstimatedMinutes(30);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add topic");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            Add Topic
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topic Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Newton's Laws of Motion"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-2 px-3 rounded-lg border transition-all capitalize font-medium ${
                    difficulty === level
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estimated Study Time
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                disabled={isLoading}
              />
              <div className="text-lg font-bold text-indigo-400 min-w-[4rem] text-center">
                {estimatedMinutes}m
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Quick</span>
              <span>Medium</span>
              <span>Deep Dive</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Add Topic
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}