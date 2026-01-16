"use client";

import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/Button";
import { Settings, Volume2, Palette, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
                <Settings className="w-8 h-8" />
                Settings
              </h1>
              <p className="text-gray-400">Configure your study environment</p>
            </div>

            {/* Audio Settings */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Audio Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Master Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="70"
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="theme" defaultChecked />
                  <span className="text-gray-300">Dark Mode (Default)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="theme" disabled />
                  <span className="text-gray-500">Light Mode (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-gray-300">Session Reminders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-gray-300">Streak Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-gray-300">Daily Summary</span>
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}