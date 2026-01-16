"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useSubjects } from "@/hooks/useSubjects";
import { useSyllabus } from "@/hooks/useSyllabus";
import * as queries from "@/lib/supabase/queries";
import { Button } from "@/components/ui/Button";
import { Plus, BookOpen } from "lucide-react";
import { AddSubjectDialog } from "./AddSubjectDialog";
import { EditTopicDialog } from "./EditTopicDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { SubjectCard } from "./SubjectCard";
import type { Chapter, Topic } from "@/types/database.types";

export function SyllabusTree() {
  const { user } = useStore();
  const { subjects, loading: subjectsLoading, fetchSubjects, addSubject } = useSubjects();
  const {
    loading: syllabusLoading,
    addChapter,
    addTopic,
    updateTopic,
    deleteTopic,
    deleteChapter,
  } = useSyllabus();

  const [chapters, setChapters] = useState<Record<string, Chapter[]>>({});
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editTopicOpen, setEditTopicOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "subject" | "chapter" | "topic";
    id: string;
  } | null>(null);

  // Load subjects on mount
  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user, fetchSubjects]);

  // Load chapters and topics when subjects change
  useEffect(() => {
    const loadSyllabusData = async () => {
      if (!user || subjects.length === 0) {
        setChapters({});
        setTopics({});
        return;
      }

      try {
        const chaptersData: Record<string, Chapter[]> = {};
        const topicsData: Record<string, Topic[]> = {};

        for (const subject of subjects) {
          const subjectChapters = await queries.fetchChapters(subject.id);
          chaptersData[subject.id] = subjectChapters;

          for (const chapter of subjectChapters) {
            const chapterTopics = await queries.fetchTopics(chapter.id);
            topicsData[chapter.id] = chapterTopics;
          }
        }

        setChapters(chaptersData);
        setTopics(topicsData);
      } catch (error) {
        console.error("Failed to load syllabus data:", error);
      }
    };

    loadSyllabusData();
  }, [subjects, user]);

  const handleDeleteSubject = async (subjectId: string) => {
    setDeleteTarget({ type: "subject", id: subjectId });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    setDeleteTarget({ type: "chapter", id: chapterId });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteTopic = async (topicId: string) => {
    setDeleteTarget({ type: "topic", id: topicId });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "subject") {
        const { deleteSubject } = await import("@/lib/supabase/queries");
        await deleteSubject(deleteTarget.id);
        setSubjects(subjects.filter((s) => s.id !== deleteTarget.id));
      } else if (deleteTarget.type === "chapter") {
        await deleteChapter(deleteTarget.id);
        // Update local state
        Object.keys(chapters).forEach((subjectId) => {
          setChapters((prev) => ({
            ...prev,
            [subjectId]: prev[subjectId].filter((c) => c.id !== deleteTarget.id),
          }));
        });
      } else if (deleteTarget.type === "topic") {
        await deleteTopic(deleteTarget.id);
        Object.keys(topics).forEach((chapterId) => {
          setTopics((prev) => ({
            ...prev,
            [chapterId]: prev[chapterId].filter((t) => t.id !== deleteTarget.id),
          }));
        });
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setEditTopicOpen(true);
  };

  const handleUpdateTopic = async (updates: Partial<Topic>) => {
    if (!selectedTopic) return;
    try {
      await updateTopic(selectedTopic.id, updates);
      setTopics((prev) => ({
        ...prev,
        [selectedTopic.chapter_id]: prev[selectedTopic.chapter_id].map((t) =>
          t.id === selectedTopic.id ? { ...t, ...updates } : t
        ),
      }));
      setEditTopicOpen(false);
      setSelectedTopic(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const isLoading = subjectsLoading || syllabusLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Your Syllabus
          </h1>
          <p className="text-gray-400 mt-1">
            {subjects.length} subject{subjects.length !== 1 ? "s" : ""} •{" "}
            {Object.keys(topics).length} topics
          </p>
        </div>

        <Button
          onClick={() => setAddSubjectOpen(true)}
          variant="primary"
          className="gap-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      {/* Subjects List */}
      {subjects.length > 0 ? (
        <div className="space-y-4">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              chapters={chapters[subject.id] || []}
              topics={topics}
              onAddChapter={addChapter}
              onAddTopic={addTopic}
              onEditTopic={handleEditTopic}
              onDeleteTopic={handleDeleteTopic}
              onDeleteSubject={handleDeleteSubject}
              onDeleteChapter={handleDeleteChapter}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Subjects Yet</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Start building your study mission by adding your first subject. You can
            organize it into chapters and topics.
          </p>
          <Button onClick={() => setAddSubjectOpen(true)} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Subject
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <AddSubjectDialog
        isOpen={addSubjectOpen}
        isLoading={isLoading}
        onSubmit={addSubject}
        onClose={() => setAddSubjectOpen(false)}
      />

      {selectedTopic && (
        <EditTopicDialog
          isOpen={editTopicOpen}
          isLoading={syllabusLoading}
          topic={selectedTopic}
          onSubmit={handleUpdateTopic}
          onClose={() => {
            setEditTopicOpen(false);
            setSelectedTopic(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title={`Delete ${deleteTarget?.type === "subject" ? "Subject" : deleteTarget?.type === "chapter" ? "Chapter" : "Topic"}?`}
        description={`This action cannot be undone. All nested items will also be deleted.`}
        confirmText="Delete"
        isDangerous
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

// Helper function to update subjects in store (we'll need this)
function setSubjects(subjects: any) {
  // This would be imported from store
}