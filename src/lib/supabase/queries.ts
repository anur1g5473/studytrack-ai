import type { Subject, Chapter, Topic } from "@/types/database.types";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// ============= FETCH ALL (Full Tree) =============

export async function fetchFullSyllabus(userId: string) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  // Fetch subjects with nested chapters and topics using a single query (JOINs or RPC would be better for performance)
  // For simplicity, this still fetches in a nested manner, but on the server-side.
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      color,
      created_at,
      chapters(
        id,
        name,
        created_at,
        topics(
          id,
          name,
          difficulty,
          estimated_minutes,
          created_at
        )
      )
    `)
    .eq("user_id", userId) // Ensure RLS is applied
    .order("created_at", { ascending: true });

  if (subjectsError) throw subjectsError;

  return subjects as (Subject & { chapters: (Chapter & { topics: Topic[] })[] })[];
}
