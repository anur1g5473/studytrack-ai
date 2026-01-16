"use client";

import { MOOD_ENVIRONMENTS } from "@/types/focus.types";
import type { MoodEnvironment } from "@/types/focus.types";

type MoodEnvironmentSelectorProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function MoodEnvironmentSelector({
  selectedId,
  onSelect,
}: MoodEnvironmentSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Study Atmosphere</h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {MOOD_ENVIRONMENTS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
              selectedId === mood.id
                ? "border-indigo-500 bg-indigo-500/20"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
            }`}
            title={mood.description}
          >
            <div className="text-2xl mb-1">{mood.icon}</div>
            <div className="text-xs font-medium text-gray-300 text-center">
              {mood.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}