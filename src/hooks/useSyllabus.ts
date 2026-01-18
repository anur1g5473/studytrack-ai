"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
// import * as queries from "@/lib/supabase/queries"; // Removed direct Supabase queries
import type { Chapter, Topic } from "@/types/database.types";

export function useSyllabus() {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chapters
  const addChapter = useCallback(
    async (subjectId: string, name: string) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/syllabus/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectId, name }),
        });
        const data = await response.json();

        if (response.ok) {
          return data;
        } else {
          throw new Error(data.error || "Failed to add chapter.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add chapter";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const updateChapter = useCallback(async (id: string, updates: Partial<Chapter>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/syllabus/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || "Failed to update chapter.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update chapter";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChapter = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/syllabus/chapters/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete chapter.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete chapter";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Topics
  const addTopic = useCallback(
    async (
      chapterId: string,
      name: string,
      difficulty: "easy" | "medium" | "hard" = "medium",
      estimatedMinutes: number = 30
    ) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/syllabus/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chapterId, name, difficulty, estimatedMinutes }),
        });
        const data = await response.json();

        if (response.ok) {
          return data;
        } else {
          throw new Error(data.error || "Failed to add topic.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add topic";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const updateTopic = useCallback(async (id: string, updates: Partial<Topic>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/syllabus/topics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || "Failed to update topic.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update topic";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTopic = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/syllabus/topics/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete topic.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete topic";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addChapter,
    updateChapter,
    deleteChapter,
    addTopic,
    updateTopic,
    deleteTopic,
  };
}
