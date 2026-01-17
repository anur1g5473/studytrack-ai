export type FlashcardSet = {
  id: string;
  user_id: string;
  topic_id?: string;
  title: string;
  description?: string;
  created_at: string;
  card_count?: number; // Virtual field
  cards_due?: number; // Virtual field
};

export type Flashcard = {
  id: string;
  set_id: string;
  user_id: string;
  front: string;
  back: string;
  box: number;
  interval: number;
  ease_factor: number;
  next_review_date: string;
  last_reviewed?: string;
  created_at: string;
};

export type ReviewRating = "again" | "hard" | "good" | "easy";