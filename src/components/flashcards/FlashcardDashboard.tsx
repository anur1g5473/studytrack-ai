"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import * as queries from "@/lib/supabase/flashcard-queries";
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

  const fetchSets = async () => {
    if (!user) return;
    try {
      const data = await queries.fetchSetsWithStats(user.id);
      setSets(data);
    } catch (error) {
      console.error("Failed to fetch sets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [user]);

  const handleStudy = async (setId: string) => {
    try {
      // First try to get due cards
      let cards = await queries.fetchDueCards(setId);
      
      // If no cards due, ask if they want to review all (for now just fetch all)
      if (cards.length === 0) {
        cards = await queries.fetchAllCards(setId);
      }

      if (cards.length > 0) {
        setActiveStudySet(cards);
      } else {
        alert("No cards in this set!");
      }
    } catch (error) {
      console.error("Error starting study:", error);
    }
  };

  const handleDelete = async (setId: string) => {
    if (confirm("Delete this flashcard set?")) {
      await queries.deleteSet(setId);
      setSets(sets.filter((s) => s.id !== setId));
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