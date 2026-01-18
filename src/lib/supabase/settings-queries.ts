import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function fetchUserProfile(userId: string) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
