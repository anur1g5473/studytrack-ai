"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import * as queries from "@/lib/supabase/queries";
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
        const chapter = await queries.createChapter(user.id, subjectId, name);
        return chapter;
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
      return await queries.updateChapter(id, updates);
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
      await queries.deleteChapter(id);
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
      difficulty: "easy" | "medium" | "hard" = "medium"
    ) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const topic = await queries.createTopic(
          user.id,
          chapterId,
          name,
          difficulty
        );
        return topic;
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
      return await queries.updateTopic(id, updates);
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
      await queries.deleteTopic(id);
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