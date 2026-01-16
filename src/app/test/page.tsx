"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function TestPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      setStatus("loading");
      setMessage("Connecting to Supabase...");

      const supabase = createClient();

      // Test 1: Check if we can connect
      const { data, error } = await supabase.from("profiles").select("count");

      if (error) {
        // If table doesn't exist or no rows, that's okay for now
        if (error.code === "PGRST116" || error.message.includes("0 rows")) {
          setStatus("success");
          setMessage("Supabase Connected Successfully!");
          setDetails("Database is ready. No profiles yet (expected).");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("Supabase Connected Successfully!");
        setDetails(`Connection verified. Profiles table accessible.`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Connection Failed");
      setDetails(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          System Diagnostics
        </h1>

        {/* Status Display */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Status Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              status === "loading"
                ? "bg-yellow-500/20 border-2 border-yellow-500"
                : status === "success"
                ? "bg-green-500/20 border-2 border-green-500"
                : "bg-red-500/20 border-2 border-red-500"
            }`}
          >
            {status === "loading" ? (
              <svg
                className="w-8 h-8 text-yellow-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : status === "success" ? (
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          {/* Status Text */}
          <h2
            className={`text-xl font-semibold ${
              status === "loading"
                ? "text-yellow-500"
                : status === "success"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </h2>

          {/* Details */}
          {details && (
            <p className="text-sm text-gray-400 text-center">{details}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={testConnection} variant="secondary" className="w-full">
            Re-test Connection
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Environment Check */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Environment Variables:
          </h3>
          <div className="space-y-1 text-xs font-mono">
            <p className="text-gray-400">
              SUPABASE_URL:{" "}
              <span
                className={
                  process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}
              </span>
            </p>
            <p className="text-gray-400">
              SUPABASE_ANON_KEY:{" "}
              <span
                className={
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? "✓ Set"
                  : "✗ Missing"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}