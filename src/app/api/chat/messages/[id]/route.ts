import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Input Validation for id
    if (typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Invalid message ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the message

    if (error) {
      console.error("Error deleting chat message:", error);
      return NextResponse.json({ error: "Failed to delete chat message." }, { status: 500 });
    }

    return NextResponse.json({ message: "Chat message deleted successfully." });
  } catch (error: any) {
    console.error("API Chat Message DELETE Error:", error?.message);
    return NextResponse.json({ error: error?.message || "An unexpected error occurred." }, { status: 500 });
  }
}
