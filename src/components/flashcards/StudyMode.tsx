"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import type { Flashcard, ReviewRating } from "@/types/flashcard.types";
import { calculateNextReview } from "@/lib/srs-algorithm";
import * as queries from "@/lib/supabase/flashcard-queries";
import { Button } from "@/components/ui/Button";

type StudyModeProps = {
  cards: Flashcard[];
  onClose: () => void;
};

export function StudyMode({ cards, onClose }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [studyQueue, setStudyQueue] = useState(cards);

  const currentCard = studyQueue[currentIndex];

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRate = async (rating: ReviewRating) => {
    if (!currentCard) return;

    // Calculate new interval
    const updates = calculateNextReview(currentCard, rating);

    // Save to DB
    await queries.updateCardProgress(currentCard.id, updates);

    // If rated "Again", re-queue it at end of session
    if (rating === "again") {
      setStudyQueue((prev) => [...prev, currentCard]);
    }

    // Move to next
    if (currentIndex < studyQueue.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150); // Slight delay for smoother transition
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f] p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold text-white">Session Complete!</h2>
          <p className="text-gray-400">You've reviewed all cards in this queue.</p>
          <div className="flex gap-4">
            <Button onClick={onClose} variant="secondary">
              Back to Dashboard
            </Button>
            <Button onClick={() => window.location.reload()} variant="primary">
              Review Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        <div className="text-gray-400 text-sm">
          Card {currentIndex + 1} of {studyQueue.length}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-6 perspective-1000">
        <div
          className="relative w-full max-w-xl aspect-[3/2] cursor-pointer group perspective-1000"
          onClick={handleFlip}
        >
          <motion.div
            className="w-full h-full relative preserve-3d transition-all duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-gray-900 border border-gray-700 rounded-2xl p-8 flex items-center justify-center text-center shadow-2xl">
              <h3 className="text-2xl font-medium text-white">{currentCard.front}</h3>
              <p className="absolute bottom-4 text-xs text-gray-500 uppercase tracking-widest">
                Click to Flip
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 backface-hidden bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-8 flex items-center justify-center text-center shadow-2xl"
              style={{ transform: "rotateY(180deg)" }}
            >
              <p className="text-xl text-indigo-100">{currentCard.back}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 pb-12">
        <AnimatePresence>
          {isFlipped ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 gap-3 max-w-2xl mx-auto"
            >
              <button
                onClick={() => handleRate("again")}
                className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-200 hover:bg-red-900/50 transition-colors"
              >
                <div className="text-xs uppercase font-bold mb-1">Again</div>
                <div className="text-xs opacity-70">&lt; 1 min</div>
              </button>
              <button
                onClick={() => handleRate("hard")}
                className="p-4 bg-orange-900/30 border border-orange-500/30 rounded-xl text-orange-200 hover:bg-orange-900/50 transition-colors"
              >
                <div className="text-xs uppercase font-bold mb-1">Hard</div>
                <div className="text-xs opacity-70">2 days</div>
              </button>
              <button
                onClick={() => handleRate("good")}
                className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-200 hover:bg-blue-900/50 transition-colors"
              >
                <div className="text-xs uppercase font-bold mb-1">Good</div>
                <div className="text-xs opacity-70">4 days</div>
              </button>
              <button
                onClick={() => handleRate("easy")}
                className="p-4 bg-green-900/30 border border-green-500/30 rounded-xl text-green-200 hover:bg-green-900/50 transition-colors"
              >
                <div className="text-xs uppercase font-bold mb-1">Easy</div>
                <div className="text-xs opacity-70">7 days</div>
              </button>
            </motion.div>
          ) : (
            <div className="text-center">
              <Button onClick={handleFlip} size="lg" className="px-12">
                Show Answer
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}