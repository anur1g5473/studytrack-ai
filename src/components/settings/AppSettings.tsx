"use client";

import { useState } from "react";
import { Settings, Bell, Moon, Sun } from "lucide-react";

export function AppSettings() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  // For MVP this is local state, could be persisted in localStorage
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-400" />
        System Preferences
      </h2>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Bell className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-medium">Session Alerts</p>
              <p className="text-xs text-gray-500">Get notified when breaks end</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={() => setNotifications(!notifications)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Theme (Visual only for now) */}
        <div className="flex items-center justify-between opacity-60 cursor-not-allowed" title="Coming Soon">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Sun className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-medium">Light Mode</p>
              <p className="text-xs text-gray-500">Currently locked to Dark Mode</p>
            </div>
          </div>
          <div className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">Locked</div>
        </div>
      </div>
    </div>
  );
}