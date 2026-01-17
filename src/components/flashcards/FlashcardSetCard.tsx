"use client";

import { motion } from "framer-motion";
import { Book, Clock, Play, Trash2, Edit2 } from "lucide-react";
import type { FlashcardSet } from "@/types/flashcard.types";
import { Button } from "@/components/ui/Button";

type FlashcardSetCardProps = {
  set: FlashcardSet;
  onStudy: (setId: string) => void;
  onDelete: (setId: string) => void;
};

export function FlashcardSetCard({ set, onStudy, onDelete }: FlashcardSetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-600/20 rounded-lg text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <Book className="w-6 h-6" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(set.id)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 truncate">{set.title}</h3>
      <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10">
        {set.description || "No description provided."}
      </p>

      <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Book className="w-4 h-4" />
          <span>{set.card_count || 0} Cards</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-orange-400" />
          <span className="text-orange-300">{set.cards_due || 0} Due</span>
        </div>
      </div>

      <Button
        onClick={() => onStudy(set.id)}
        className="w-full gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all"
        variant={set.cards_due && set.cards_due > 0 ? "primary" : "secondary"}
      >
        <Play className="w-4 h-4" />
        {set.cards_due && set.cards_due > 0 ? "Review Now" : "Study All"}
      </Button>
    </motion.div>
  );
}