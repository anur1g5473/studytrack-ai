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

export async function GET() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Access Denied: Insufficient Clearance Level." }, { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return NextResponse.json({ error: "Failed to fetch announcements." }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Admin Announcements GET API Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Access Denied: Insufficient Clearance Level." }, { status: 403 });
  }

  try {
    const { message, type } = await request.json();

    // Input validation
    if (typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Announcement message cannot be empty." }, { status: 400 });
    }
    if (message.length > 500) { // Example length limit
      return NextResponse.json({ error: "Announcement message is too long." }, { status: 400 });
    }
    if (type && !["info", "warning", "alert"].includes(type)) {
      return NextResponse.json({ error: "Invalid announcement type." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({ message, type: type || "info", created_by: user.id });

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
