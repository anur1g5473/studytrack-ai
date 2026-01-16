"use client";

import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading } = useStore();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state
    async function initAuth() {
      setIsLoading(true);
      const supabase = createClient();

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile);
        } else {
          // Create profile if it doesn't exist (should exist via trigger)
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || "",
              avatar_url: session.user.user_metadata?.avatar_url || "",
            })
            .select()
            .single();

          if (newProfile) {
            setUser(newProfile);
          }
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
      setInitialized(true);
    }

    initAuth();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Update user state
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser(profile);
            }
          });
      } else {
        setUser(null);
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Initializing mission control...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}