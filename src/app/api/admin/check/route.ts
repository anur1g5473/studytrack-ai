import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ isAdmin: false, error: userError?.message || "Unauthorized" }, { status: 401 });
  }

  // Check admin status in profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ isAdmin: false, error: profileError?.message || "Access Denied: Insufficient Clearance Level." }, { status: 403 });
  }

  return NextResponse.json({ isAdmin: true });
}