"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Plus, Trash2, Save } from "lucide-react";
import * as queries from "@/lib/supabase/flashcard-queries";
import { useStore } from "@/store/useStore";

type ManualSetDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type CardDraft = {
  front: string;
  back: string;
};

export function ManualSetDialog({ isOpen, onClose, onSuccess }: ManualSetDialogProps) {
  const { user } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<CardDraft[]>([{ front: "", back: "" }]);
  const [loading, setLoading] = useState(false);

  const handleAddCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index: number, field: "front" | "back", value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    // Filter out empty cards
    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      alert("Please add at least one valid card.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Set
      const newSet = await queries.createFlashcardSet(
        user.id,
        title,
        description || "Manual deck"
      );

      // 2. Create Cards
      const cardsToSave = validCards.map((c) => ({
        set_id: newSet.id,
        user_id: user.id,
        front: c.front,
        back: c.back,
      }));

      await queries.createFlashcards(cardsToSave);

      onSuccess();
      onClose();
      // Reset form
      setTitle("");
      setDescription("");
      setCards([{ front: "", back: "" }]);
    } catch (error) {
      console.error("Failed to create set:", error);
      alert("Failed to save flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create Flashcard Deck</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Deck Info */}
          <div className="space-y-4 mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deck Title (e.g. History Chapter 1)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (Optional)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6">
            {cards.map((card, index) => (
              <div key={index} className="flex gap-3 items-start group">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={card.front}
                    onChange={(e) => handleCardChange(index, "front", e.target.value)}
                    placeholder={`Card ${index + 1} Front (Question)`}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-indigo-500 outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={card.back}
                    onChange={(e) => handleCardChange(index, "back", e.target.value)}
                    placeholder={`Card ${index + 1} Back (Answer)`}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCard(index)}
                  className="p-2 text-gray-500 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity mt-2"
                  disabled={cards.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 border-t border-gray-800 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddCard}
              className="flex-1 gap-2"
            >
              <Plus className="w-4 h-4" /> Add Card
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 gap-2"
              disabled={loading || !title.trim()}
            >
              <Save className="w-4 h-4" /> Save Deck
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}