"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Zap, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn, sanitizeInput } from "@/lib/utils";

export function DashboardHeader() {
  const { user } = useStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold hidden sm:inline">
              <span className="text-white">Study</span>
              <span className="text-indigo-500">Track</span>
              <span className="text-cyan-400">.AI</span>
            </span>
          </Link>

          {/* User Info & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {user?.full_name ? sanitizeInput(user.full_name) : "Mission Specialist"}
              </div>
              <div className="text-xs text-gray-400">Level {user?.current_level || 1}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 md:hidden flex flex-col gap-3 border-t border-gray-800 pt-4">
            <div className="text-sm">
              <div className="font-medium text-white">
                {user?.full_name ? sanitizeInput(user.full_name) : "Mission Specialist"}
              </div>
              <div className="text-xs text-gray-400">Level {user?.current_level || 1}</div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}