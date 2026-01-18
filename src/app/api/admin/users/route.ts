import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Profile } from "@/types/database.types";

// Helper to check admin status
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return !error && profile?.is_admin === true;
}

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Access Denied: Insufficient Clearance Level." }, { status: 403 });
  }

  const { data: users, error: fetchError } = await supabase
    .from("profiles")
    .select("id, full_name, email, current_level, xp_points, is_admin, created_at") // Select necessary fields
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error fetching users:", fetchError);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }

  return NextResponse.json(users);
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
    const { userId, action, isAdmin: newIsAdmin, isBanned: newIsBanned } = await request.json();

    // Input validation
    if (typeof userId !== "string" || userId.trim() === "") {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }
    if (!["updateStatus"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
    if (action === "updateStatus") {
      if (typeof newIsAdmin !== "boolean" || typeof newIsBanned !== "boolean") {
        return NextResponse.json({ error: "Invalid admin or banned status." }, { status: 400 });
      }
      // Prevent admin from changing their own status (or ensure this is handled client-side/via RLS)
      if (userId === user.id) {
        return NextResponse.json({ error: "Cannot modify your own admin status via this endpoint." }, { status: 403 });
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ is_admin: newIsAdmin, is_banned: newIsBanned })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user status:", error);
        return NextResponse.json({ error: "Failed to update user status." }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "User status updated successfully." });
  } catch (error: any) {
    console.error("Admin Users API Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
