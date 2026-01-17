import { createClient } from "@/lib/supabase/client";
import type { Flashcard, FlashcardSet } from "@/types/flashcard.types";

const supabase = createClient();

// Fetch all sets with counts
export async function fetchFlashcardSets(userId: string) {
  const { data: sets, error } = await supabase
    .from("flashcard_sets")
    .select("*, flashcards(count), flashcards!inner(next_review_date)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Process to get clean counts
  return sets.map((set: any) => {
    const cards = set.flashcards || [];
    // Count total cards (Supabase returns array of objects for count)
    const totalCount = set.flashcards[0]?.count || 0; 
    
    // Count due cards manually or via separate query if dataset large
    // For MVP, we'll fetch cards due separately or filter here if small
    // Let's do a cleaner approach for counts:
    return {
      ...set,
      card_count: 0, // We'll fix this in a better way below
      cards_due: 0
    };
  });
}

// Improved fetch with separate counts
export async function fetchSetsWithStats(userId: string) {
  // 1. Get Sets
  const { data: sets, error } = await supabase
    .from("flashcard_sets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
    
  if (error) throw error;

  // 2. Get Card Stats
  const setsWithStats = await Promise.all(sets.map(async (set) => {
    const { count } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("set_id", set.id);

    const { count: dueCount } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("set_id", set.id)
      .lte("next_review_date", new Date().toISOString());

    return {
      ...set,
      card_count: count || 0,
      cards_due: dueCount || 0
    };
  }));

  return setsWithStats as FlashcardSet[];
}

export async function createFlashcardSet(userId: string, title: string, description: string, topicId?: string) {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .insert({
      user_id: userId,
      title,
      description,
      topic_id: topicId
    })
    .select()
    .single();

  if (error) throw error;
  return data as FlashcardSet;
}

export async function createFlashcards(cards: { set_id: string; user_id: string; front: string; back: string }[]) {
  const { data, error } = await supabase
    .from("flashcards")
    .insert(cards)
    .select();

  if (error) throw error;
  return data;
}

export async function fetchDueCards(setId: string) {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("set_id", setId)
    .lte("next_review_date", new Date().toISOString()) // Due now or in past
    .order("next_review_date");

  if (error) throw error;
  return data as Flashcard[];
}

export async function fetchAllCards(setId: string) {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("set_id", setId)
    .order("created_at");

  if (error) throw error;
  return data as Flashcard[];
}

export async function updateCardProgress(cardId: string, updates: Partial<Flashcard>) {
  const { error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", cardId);

  if (error) throw error;
}

export async function deleteSet(setId: string) {
  const { error } = await supabase.from("flashcard_sets").delete().eq("id", setId);
  if (error) throw error;
}