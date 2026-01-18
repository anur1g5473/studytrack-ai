"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Trash2, Edit, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/announcements");
      const data = await response.json();
      if (response.ok) {
        setAnnouncements(data);
      } else {
        throw new Error(data.error || "Failed to fetch announcements.");
      }
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newAnnouncementMessage.trim() === "") {
      setError("Announcement message cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newAnnouncementMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewAnnouncementMessage("");
        fetchAnnouncements(); // Re-fetch to show new announcement
      } else {
        throw new Error(data.error || "Failed to create announcement.");
      }
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setError(err.message || "Failed to create announcement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchAnnouncements(); // Re-fetch to update list
      } else {
        throw new Error(data.error || "Failed to delete announcement.");
      }
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      setError(err.message || "Failed to delete announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Announcements Management</h1>

      {error && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Create New Announcement */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Create New Announcement</h2>
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            rows={4}
            placeholder="Enter announcement message..."
            value={newAnnouncementMessage}
            onChange={(e) => setNewAnnouncementMessage(e.target.value)}
            required
          ></textarea>
          <Button type="submit" isLoading={loading} className="w-full">
            <PlusCircle className="w-4 h-4 mr-2" /> Publish Announcement
          </Button>
        </form>
      </div>

      {/* Existing Announcements List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Existing Announcements</h2>
        {loading && <p className="text-gray-400 text-center">Loading announcements...</p>}
        {!loading && announcements.length === 0 && !error && (
          <p className="text-gray-500 text-center">No announcements found.</p>
        )}

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-white text-base mb-1">{announcement.message}</p>
                <p className="text-gray-400 text-xs">
                  Published: {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {/* Edit functionality can be added here if needed */}
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="text-red-400 hover:bg-red-900/20 p-2"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
