"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import * as queries from "@/lib/supabase/queries";
import type { Subject, Chapter, Topic } from "@/types/database.types";

export function useSubjects() {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const fetchSubjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await queries.fetchSubjects(user.id);
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addSubject = useCallback(
    async (name: string, color?: string) => {
      if (!user) return;
      try {
        const newSubject = await queries.createSubject(user.id, name, color);
        setSubjects((prev) => [...prev, newSubject]);
        return newSubject;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add subject";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const updateSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
    try {
      const updated = await queries.updateSubject(id, updates);
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update subject";
      setError(message);
      throw err;
    }
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    try {
      await queries.deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete subject";
      setError(message);
      throw err;
    }
  }, []);

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
  };
}