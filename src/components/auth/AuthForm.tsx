"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "./GoogleButton";
import { MissionGoalSelect } from "./MissionGoalSelect";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthFormProps = {
  type: "login" | "signup";
};

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    missionGoal: "Other",
    examDate: "",
    dailyStudyHours: 4,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === "login") {
        const { error } = await signInWithEmail(formData.email, formData.password);
        if (error) throw error;
        router.push("/dashboard");
      } else {
        // Sign up
        const { error: signUpError } = await signUpWithEmail(
          formData.email,
          formData.password,
          formData.fullName
        );
        
        if (signUpError) throw signUpError;

        // Update profile with additional info
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          await supabase.from("profiles").update({
            mission_goal: formData.missionGoal,
            exam_date: formData.examDate || null,
            daily_study_hours: formData.dailyStudyHours,
          }).eq("id", userData.user.id);
        }

        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dailyStudyHours" ? parseInt(value) || 4 : value,
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Mission Control Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="agent@studytrack.ai"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Access Code
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {/* Full Name (Signup only) */}
        {type === "signup" && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
              Agent Designation
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>
        )}

        {/* Mission Goal (Signup only) */}
        {type === "signup" && (
          <MissionGoalSelect
            value={formData.missionGoal}
            onChange={(value) => setFormData(prev => ({ ...prev, missionGoal: value }))}
          />
        )}

        {/* Exam Date (Signup only) */}
        {type === "signup" && (
          <div>
            <label htmlFor="examDate" className="block text-sm font-medium text-gray-300 mb-2">
              Mission End Date (Optional)
            </label>
            <input
              id="examDate"
              name="examDate"
              type="date"
              value={formData.examDate}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">When is your exam/final goal date?</p>
          </div>
        )}

        {/* Daily Study Hours (Signup only) */}
        {type === "signup" && (
          <div>
            <label htmlFor="dailyStudyHours" className="block text-sm font-medium text-gray-300 mb-2">
              Daily Mission Hours
            </label>
            <div className="flex items-center gap-4">
              <input
                id="dailyStudyHours"
                name="dailyStudyHours"
                type="range"
                min="1"
                max="8"
                step="1"
                value={formData.dailyStudyHours}
                onChange={handleChange}
                className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
              />
              <div className="text-lg font-bold text-indigo-400 min-w-[4rem] text-center">
                {formData.dailyStudyHours}h
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Light</span>
              <span>Optimal</span>
              <span>Intense</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full"
        >
          {type === "login" ? "Access Mission Control" : "Initiate Mission"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0a0a0f] text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <GoogleButton />

      {/* Switch Form Link */}
      <div className="mt-8 text-center">
        <p className="text-gray-500">
          {type === "login" ? "New agent?" : "Already have access?"}{" "}
          <Link
            href={type === "login" ? "/signup" : "/login"}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {type === "login" ? "Initiate New Mission" : "Access Mission Control"}
          </Link>
        </p>
        <p className="mt-2">
          <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
            ← Return to Home
          </Link>
        </p>
      </div>
    </div>
  );
}