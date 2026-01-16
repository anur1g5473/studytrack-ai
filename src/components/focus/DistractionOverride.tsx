"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";
import type { Distraction } from "@/types/focus.types";

const DISTRACTION_TYPES = [
  { id: "phone", label: "📱 Phone/Alert", hint: "Notification or call" },
  { id: "alert", label: "🔔 Alert", hint: "Browser/system alert" },
  {
    id: "mind-wandering",
    label: "💭 Mind Wandering",
    hint: "Lost focus",
  },
  { id: "confusion", label: "❓ Confusion", hint: "Didn't understand" },
  { id: "tiredness", label: "😴 Tiredness", hint: "Feeling sleepy" },
  { id: "other", label: "📌 Other", hint: "Something else" },
];

type DistractionOverrideProps = {
  isOpen: boolean;
  isPaused: boolean;
  onLogDistraction: (distraction: Omit<Distraction, "timestamp">) => void;
  onResume: () => void;
};

export function DistractionOverride({
  isOpen,
  isPaused,
  onLogDistraction,
  onResume,
}: DistractionOverrideProps) {
  const [note, setNote] = useState("");

  if (!isOpen || !isPaused) return null;

  const handleSelect = (type: string) => {
    onLogDistraction({
      type: type as Distraction["type"],
      note: note || undefined,
    });
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Mission Interrupted</h2>
            <p className="text-sm text-gray-400 mt-1">
              What caused the interruption?
            </p>
          </div>
        </div>

        {/* Distraction Options */}
        <div className="space-y-2 mb-4">
          {DISTRACTION_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className="w-full p-3 text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors group"
            >
              <div className="font-medium text-white group-hover:text-indigo-300">
                {type.label}
              </div>
              <div className="text-xs text-gray-500">{type.hint}</div>
            </button>
          ))}
        </div>

        {/* Optional Note */}
        <div className="mb-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add optional note..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onResume}
            className="flex-1"
          >
            Skip & Resume
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onLogDistraction({
                type: "other",
                note: note || "Quick pause",
              });
            }}
            className="flex-1"
          >
            Log & Resume
          </Button>
        </div>
      </div>
    </div>
  );
}