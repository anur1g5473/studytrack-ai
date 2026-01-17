"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { User, Save, Loader2 } from "lucide-react";
import { updateUserProfile } from "@/lib/supabase/settings-queries";
import { useStore } from "@/store/useStore";

// Preset avatars (using DiceBear API for generated avatars)
const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryker",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot",
];

export function ProfileSettings() {
  const { user, setUser } = useStore();
  const [name, setName] = useState(user?.full_name || "");
  const [avatar, setAvatar] = useState(user?.avatar_url || AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    try {
      const updatedUser = await updateUserProfile(user.id, {
        full_name: name,
        avatar_url: avatar,
      });
      setUser(updatedUser);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-400" />
        Agent Identity
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Select Avatar
          </label>
          <div className="flex flex-wrap gap-3">
            {AVATARS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setAvatar(url)}
                className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${
                  avatar === url
                    ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20"
                    : "border-gray-700 opacity-60 hover:opacity-100 hover:border-gray-500"
                }`}
              >
                <img src={url} alt="Avatar" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Agent Name"
          />
        </div>

        {/* Email (Read Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Email (ID)
          </label>
          <input
            type="text"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className={`text-sm ${message.includes("Failed") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </p>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Identity
          </Button>
        </div>
      </form>
    </div>
  );
}