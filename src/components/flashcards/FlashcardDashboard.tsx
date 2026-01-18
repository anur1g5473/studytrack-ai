"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
// import * as queries from "@/lib/supabase/flashcard-queries"; // Removed direct Supabase queries
import { FlashcardSetCard } from "./FlashcardSetCard";
import { CreateSetDialog } from "./CreateSetDialog";
import { ManualSetDialog } from "./ManualSetDialog";
import { StudyMode } from "./StudyMode";
import { Button } from "@/components/ui/Button";
import { Plus, Zap, Sparkles } from "lucide-react";
import type { FlashcardSet, Flashcard } from "@/types/flashcard.types";

export function FlashcardDashboard() {
  const { user } = useStore();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [activeStudySet, setActiveStudySet] = useState<Flashcard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSets = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/flashcards/sets");
      const data = await response.json();
      if (response.ok) {
        setSets(data || []);
      } else {
        throw new Error(data.error || "Failed to fetch flashcard sets.");
      }
    } catch (err: any) {
      console.error("Failed to fetch sets:", err);
      setError(err.message || "Failed to load flashcard sets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [user]);

  const handleStudy = async (setId: string) => {
    if (!user) return;
    setError(null);
    try {
      // First try to get due cards
      let cards: Flashcard[] = [];
      const dueCardsResponse = await fetch(`/api/flashcards/cards?setId=${setId}&dueOnly=true`);
      const dueCardsData = await dueCardsResponse.json();

      if (dueCardsResponse.ok) {
        cards = dueCardsData;
      } else {
        console.warn("Failed to fetch due cards, attempting to fetch all cards:", dueCardsData.error);
      }

      // If no cards due, fetch all cards
      if (cards.length === 0) {
        const allCardsResponse = await fetch(`/api/flashcards/cards?setId=${setId}`);
        const allCardsData = await allCardsResponse.json();
        if (allCardsResponse.ok) {
          cards = allCardsData;
        } else {
          throw new Error(allCardsData.error || "Failed to fetch all cards for study.");
        }
      }

      if (cards.length > 0) {
        setActiveStudySet(cards);
      } else {
        alert("No cards in this set!");
      }
    } catch (err: any) {
      console.error("Error starting study:", err);
      setError(err.message || "Failed to start study session.");
    }
  };

  const handleDelete = async (setId: string) => {
    if (!user) return;
    setError(null);
    if (confirm("Delete this flashcard set? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/flashcards/sets/${setId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (response.ok) {
          setSets(sets.filter((s) => s.id !== setId));
          if (activeStudySet && activeStudySet[0]?.set_id === setId) {
            setActiveStudySet(null); // Clear study mode if the active set was deleted
          }
        } else {
          throw new Error(data.error || "Failed to delete flashcard set.");
        }
      } catch (err: any) {
        console.error("Failed to delete set:", err);
        setError(err.message || "Failed to delete flashcard set.");
      }
    }
  };

  if (activeStudySet) {
    return (
      <StudyMode
        cards={activeStudySet}
        onClose={() => {
          setActiveStudySet(null);
          fetchSets(); // Refresh stats
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            Flashcards
          </h1>
          <p className="text-gray-400 mt-1">
            Master your subjects with AI-powered spaced repetition
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsManualOpen(true)} variant="secondary" className="gap-2">
            <Plus className="w-4 h-4" />
            Manual
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your memory bank...</div>
      ) : sets.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
          <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Flashcards Yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first deck manually or let AI generate one for you.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => setIsManualOpen(true)} variant="secondary">
              Create Manual
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} variant="primary">
              AI Generate
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <FlashcardSetCard
              key={set.id}
              set={set}
              onStudy={handleStudy}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateSetDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchSets}
      />

      <ManualSetDialog
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={fetchSets}
      />
    </div>
  );
}
