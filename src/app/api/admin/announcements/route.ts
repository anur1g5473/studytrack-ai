import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper to check admin status (re-using for consistency)
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return !error && profile?.is_admin === true;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Access Denied: Insufficient Clearance Level." }, { status: 403 });
  }

  try {
    const { message } = await request.json();

    // Input validation
    if (typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Announcement message cannot be empty." }, { status: 400 });
    }
    if (message.length > 500) { // Example length limit
      return NextResponse.json({ error: "Announcement message is too long." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({ message, created_by: user.id });

    if (error) {
      console.error("Error creating announcement:", error);
      return NextResponse.json({ error: "Failed to create announcement." }, { status: 500 });
    }

    return NextResponse.json({ message: "Announcement created successfully." });
  } catch (error: any) {
    console.error("Admin Announcements API Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
