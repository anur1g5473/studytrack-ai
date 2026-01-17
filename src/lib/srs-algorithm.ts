import type { Flashcard, ReviewRating } from "@/types/flashcard.types";

/**
 * SuperMemo-2 Algorithm (Simplified)
 * Calculates the next review date based on performance
 */
export function calculateNextReview(card: Flashcard, rating: ReviewRating): Partial<Flashcard> {
  let { box, interval, ease_factor } = card;
  const now = new Date();

  // Mapping ratings to quality (0-5)
  // again: 0 (forgot), hard: 3, good: 4, easy: 5
  let quality = 0;
  if (rating === "hard") quality = 3;
  if (rating === "good") quality = 4;
  if (rating === "easy") quality = 5;

  if (quality < 3) {
    // If forgotten, reset interval but keep ease factor roughly same
    box = 1;
    interval = 1;
  } else {
    // If remembered
    if (box === 0) {
      interval = 1;
    } else if (box === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    box++;
  }

  // Update Ease Factor (standard SM-2 formula)
  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3; // Minimum cap

  // Calculate next date
  const nextDate = new Date();
  nextDate.setDate(now.getDate() + interval);

  return {
    box,
    interval,
    ease_factor,
    next_review_date: nextDate.toISOString(),
    last_reviewed: now.toISOString(),
  };
}