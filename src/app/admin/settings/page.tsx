"use client";

import { useEffect, useState } from "react";
import { createAnnouncement, fetchAnnouncements, deleteAnnouncement } from "@/lib/supabase/admin-queries";
import { Button } from "@/components/ui/Button";
import { Megaphone, Trash2, AlertTriangle, Info, CheckCircle } from "lucide-react";

export default function AdminSettings() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "alert">("info");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const data = await fetchAnnouncements();
    setAnnouncements(data || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setLoading(true);
    await createAnnouncement(message, type);
    setMessage("");
    loadData();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this announcement?")) return;
    await deleteAnnouncement(id);
    loadData();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white">System Settings</h1>

      {/* Announcement Creator */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-400" />
          Global Broadcast System
        </h2>
        
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-mono mb-2 block">Message</label>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Maintenance scheduled for tonight..."
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 uppercase font-mono mb-2 block">Type</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setType("info")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === "info" ? "bg-blue-900/30 border-blue-500 text-blue-400" : "bg-gray-800 border-transparent text-gray-400"}`}
                >Info</button>
                <button 
                  type="button"
                  onClick={() => setType("warning")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === "warning" ? "bg-yellow-900/30 border-yellow-500 text-yellow-400" : "bg-gray-800 border-transparent text-gray-400"}`}
                >Warning</button>
                <button 
                  type="button"
                  onClick={() => setType("alert")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === "alert" ? "bg-red-900/30 border-red-500 text-red-400" : "bg-gray-800 border-transparent text-gray-400"}`}
                >Alert</button>
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" isLoading={loading} className="bg-indigo-600 hover:bg-indigo-700">
                Send Broadcast
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Active Announcements */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Active Broadcasts</h3>
        {announcements.length === 0 && <p className="text-gray-500 italic">No active announcements.</p>}
        
        {announcements.map((item) => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${
                item.type === "alert" ? "bg-red-900/20 text-red-400" :
                item.type === "warning" ? "bg-yellow-900/20 text-yellow-400" :
                "bg-blue-900/20 text-blue-400"
              }`}>
                {item.type === "alert" ? <AlertTriangle className="w-5 h-5" /> : 
                 item.type === "warning" ? <Info className="w-5 h-5" /> : 
                 <CheckCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-white font-medium">{item.message}</p>
                <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}