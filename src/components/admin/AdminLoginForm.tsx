"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Shield, Lock, AlertTriangle } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // 1. Attempt Login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user found");

      // 2. Check Admin Status immediately
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", authData.user.id)
        .single();

      if (!profile?.is_admin) {
        // If not admin, kick them out immediately
        await supabase.auth.signOut();
        throw new Error("ACCESS DENIED: Insufficient Clearance Level.");
      }

      // 3. Redirect to Command Center
      router.push("/admin");
      
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border border-red-900/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wider">RESTRICTED ACCESS</h1>
        <p className="text-red-400/60 text-xs mt-2 uppercase tracking-widest">Authorized Personnel Only</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">System ID (Email)</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 pl-10 text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
              placeholder="admin@system.internal"
              required
            />
            <Shield className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Security Token (Password)</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 pl-10 text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
              placeholder="••••••••••••"
              required
            />
            <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
          </div>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          isLoading={loading}
        >
          {loading ? "VERIFYING..." : "INITIATE SESSION"}
        </Button>
      </form>
    </div>
  );
}