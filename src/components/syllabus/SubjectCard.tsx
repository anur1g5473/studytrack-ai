"use client";

import { useState } from "react";
import { Subject, Chapter, Topic } from "@/types/database.types";
import { ChevronDown, Plus, Trash2, Edit2 } from "lucide-react";
import { AddChapterDialog } from "./AddChapterDialog";
import { AddTopicDialog } from "./AddTopicDialog";
import { TopicCard } from "./TopicCard";

type SubjectCardProps = {
  subject: Subject;
  chapters: Chapter[];
  topics: Record<string, Topic[]>; // keyed by chapter ID
  onAddChapter: (subjectId: string, name: string) => Promise<void>;
  onAddTopic: (chapterId: string, name: string, difficulty: "easy" | "medium" | "hard", estimatedMinutes: number) => Promise<void>;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (topicId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
};

export function SubjectCard({
  subject,
  chapters,
  topics,
  onAddChapter,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onDeleteSubject,
  onDeleteChapter,
}: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [addChapterOpen, setAddChapterOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map((c) => c.id))
  );
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddChapter = async (name: string) => {
    setIsLoading(true);
    try {
      await onAddChapter(subject.id, name);
      setAddChapterOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTopic = async (name: string, difficulty: "easy" | "medium" | "hard", estimatedMinutes: number) => {
    if (!selectedChapter) return;
    setIsLoading(true);
    try {
      await onAddTopic(selectedChapter.id, name, difficulty, estimatedMinutes);
      setAddTopicOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* Subject Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <h2 className="font-semibold text-white text-lg">{subject.name}</h2>
          <span className="text-sm text-gray-500">
            ({chapters.length} chapters)
          </span>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddChapterOpen(true);
            }}
            className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
            title="Add chapter"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSubject(subject.id);
            }}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete subject"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </button>

      {/* Chapters */}
      {isExpanded && chapters.length > 0 && (
        <div className="border-t border-gray-800 divide-y divide-gray-800">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="bg-gray-800/20">
              {/* Chapter Header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-800/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedChapters.has(chapter.id) ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <h3 className="font-medium text-gray-300">{chapter.name}</h3>
                  <span className="text-xs text-gray-600">
                    ({topics[chapter.id]?.length || 0} topics)
                  </span>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChapter(chapter);
                      setAddTopicOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                    title="Add topic"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChapter(chapter.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>

              {/* Topics */}
              {expandedChapters.has(chapter.id) && (
                <div className="px-6 py-3 space-y-2 bg-gray-900/50">
                  {topics[chapter.id] && topics[chapter.id].length > 0 ? (
                    topics[chapter.id].map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        onEdit={onEditTopic}
                        onDelete={onDeleteTopic}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No topics yet. Click + to add one.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isExpanded && chapters.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <p className="text-sm">No chapters yet</p>
          <button
            onClick={() => setAddChapterOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 text-sm mt-2"
          >
            Add your first chapter
          </button>
        </div>
      )}

      {/* Dialogs */}
      <AddChapterDialog
        isOpen={addChapterOpen}
        isLoading={isLoading}
        subjectName={subject.name}
        onSubmit={handleAddChapter}
        onClose={() => setAddChapterOpen(false)}
      />

      {selectedChapter && (
        <AddTopicDialog
          isOpen={addTopicOpen}
          isLoading={isLoading}
          chapterName={selectedChapter.name}
          onSubmit={handleAddTopic}
          onClose={() => setAddTopicOpen(false)}
        />
      )}
    </div>
  );
}