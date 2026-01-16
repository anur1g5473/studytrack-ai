"use client";

import { signInWithGoogle } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FcGoogle } from "react-icons/fc";

export function GoogleButton() {
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      console.error("Google sign in error:", error);
      // We'll add toast notifications later
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleGoogleSignIn}
      className="w-full border border-gray-800 hover:border-gray-700"
    >
      <FcGoogle className="w-5 h-5 mr-2" />
      Continue with Google
    </Button>
  );
}