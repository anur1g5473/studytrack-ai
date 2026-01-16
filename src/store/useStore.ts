import { create } from "zustand";
import type { Profile, Subject, Chapter, Topic } from "@/types/database.types";

type AppState = {
  // User
  user: Profile | null;
  setUser: (user: Profile | null) => void;

  // Subjects
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;

  // Chapters
  chapters: Chapter[];
  setChapters: (chapters: Chapter[]) => void;

  // Topics
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
};

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Subjects
  subjects: [],
  setSubjects: (subjects) => set({ subjects }),

  // Chapters
  chapters: [],
  setChapters: (chapters) => set({ chapters }),

  // Topics
  topics: [],
  setTopics: (topics) => set({ topics }),

  // UI State
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // Reset
  reset: () =>
    set({
      user: null,
      subjects: [],
      chapters: [],
      topics: [],
      isLoading: false,
    }),
}));