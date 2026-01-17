"use client";

import { useStore } from "@/store/useStore";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { MissionSettings } from "@/components/settings/MissionSettings";
import { AppSettings } from "@/components/settings/AppSettings";

export default function SettingsPage() {
  const { user } = useStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your profile, mission, and preferences.</p>
      </div>

      <div className="grid gap-8">
        <ProfileSettings />
        <MissionSettings />
        <AppSettings />
      </div>
    </div>
  );
}