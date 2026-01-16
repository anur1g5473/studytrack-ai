import { createClient } from "@/lib/supabase/client";
import type { Subject, Chapter, Topic } from "@/types/database.types";

const supabase = createClient();

// ============= SUBJECTS =============

export async function fetchSubjects(userId: string) {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", userId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data as Subject[];
}

export async function createSubject(
  userId: string,
  name: string,
  color?: string
) {
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      user_id: userId,
      name,
      color: color || "#6366f1",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function updateSubject(id: string, updates: Partial<Subject>) {
  const { data, error } = await supabase
    .from("subjects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) throw error;
}

// ============= CHAPTERS =============

export async function fetchChapters(subjectId: string) {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data as Chapter[];
}

export async function createChapter(
  userId: string,
  subjectId: string,
  name: string
) {
  const { data, error } = await supabase
    .from("chapters")
    .insert({
      user_id: userId,
      subject_id: subjectId,
      name,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Chapter;
}

export async function updateChapter(id: string, updates: Partial<Chapter>) {
  const { data, error } = await supabase
    .from("chapters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Chapter;
}

export async function deleteChapter(id: string) {
  const { error } = await supabase.from("chapters").delete().eq("id", id);

  if (error) throw error;
}

// ============= TOPICS =============

export async function fetchTopics(chapterId: string) {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data as Topic[];
}

export async function createTopic(
  userId: string,
  chapterId: string,
  name: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  estimatedMinutes: number = 30
) {
  const { data, error } = await supabase
    .from("topics")
    .insert({
      user_id: userId,
      chapter_id: chapterId,
      name,
      difficulty,
      estimated_minutes: estimatedMinutes,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Topic;
}

export async function updateTopic(id: string, updates: Partial<Topic>) {
  const { data, error } = await supabase
    .from("topics")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Topic;
}

export async function deleteTopic(id: string) {
  const { error } = await supabase.from("topics").delete().eq("id", id);

  if (error) throw error;
}

// ============= FETCH ALL (Full Tree) =============

export async function fetchFullSyllabus(userId: string) {
  const subjects = await fetchSubjects(userId);

  const subjectsWithData = await Promise.all(
    subjects.map(async (subject) => {
      const chapters = await fetchChapters(subject.id);
      const chaptersWithData = await Promise.all(
        chapters.map(async (chapter) => {
          const topics = await fetchTopics(chapter.id);
          return { ...chapter, topics };
        })
      );
      return { ...subject, chapters: chaptersWithData };
    })
  );

  return subjectsWithData;
}