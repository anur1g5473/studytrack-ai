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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;

    // Input validation
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid announcement ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error);
      return NextResponse.json({ error: "Failed to delete announcement." }, { status: 500 });
    }

    return NextResponse.json({ message: "Announcement deleted successfully." });
  } catch (error: any) {
    console.error("Admin Delete Announcement API Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
