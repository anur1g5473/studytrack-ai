"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
// import * as queries from "@/lib/supabase/queries"; // Removed direct Supabase queries
import type { Subject } from "@/types/database.types";

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
      const response = await fetch("/api/syllabus/subjects");
      const data = await response.json();

      if (response.ok) {
        setSubjects(data);
      } else {
        throw new Error(data.error || "Failed to fetch subjects.");
      }
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
        const response = await fetch("/api/syllabus/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        const data = await response.json();

        if (response.ok) {
          setSubjects((prev) => [...prev, data]);
          return data;
        } else {
          throw new Error(data.error || "Failed to add subject.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add subject";
        setError(message);
        throw err;
      }
    },
    [user, setSubjects] // Added setSubjects to dependency array
  );

  // TODO: Update `updateSubject` and `deleteSubject` to use API routes
  const updateSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`/api/syllabus/subjects/${id}`, {
        method: "PUT", // Assuming PUT for update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (response.ok) {
        setSubjects((prev) =>
          prev.map((s) => (s.id === id ? data : s))
        ); // Assuming data is the updated subject
        return data;
      } else {
        throw new Error(data.error || "Failed to update subject.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update subject";
      setError(message);
      throw err;
    }
  }, [setSubjects]);

  const deleteSubject = useCallback(async (id: string) => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`/api/syllabus/subjects/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
      } else {
        throw new Error(data.error || "Failed to delete subject.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete subject";
      setError(message);
      throw err;
    }
  }, [setSubjects]);

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
