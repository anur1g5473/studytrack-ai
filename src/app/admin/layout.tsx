"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      console.log("Current User:", user); // DEBUG LOG

      if (!user) {
        console.log("No user found, redirecting to login");
        router.push("/admin/login"); // Redirect to admin login specifically
        return;
      }

      // Check admin status in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      console.log("Admin Profile Check:", profile); // DEBUG LOG

      if (profile?.is_admin) {
        setIsAdmin(true);
      } else {
        console.log("Not admin, kicking out");
        await supabase.auth.signOut(); // Logout if they aren't admin
        router.push("/admin/login");
      }
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Verifying clearance...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}