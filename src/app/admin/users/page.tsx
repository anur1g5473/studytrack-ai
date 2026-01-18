"use client";

import { useEffect, useState } from "react";
import { Search, Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";
// Removed imports from @/lib/supabase/client and @/lib/supabase/admin-queries

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (response.ok) {
        setUsers(data || []);
      } else {
        throw new Error(data.error || "Failed to fetch users.");
      }
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateUserStatus = async (userId: string, action: "admin" | "ban", currentStatus: boolean) => {
    setError(null);
    setLoading(true);

    const confirmMessage = 
      action === "admin"
        ? (currentStatus ? "Revoke Admin access?" : "Make this user an ADMIN?")
        : (currentStatus ? "Unban this user?" : "BAN this user? They will lose access.");

    if (!confirm(confirmMessage)) {
      setLoading(false);
      return;
    }

    try {
      const payload: any = { userId, action: "updateStatus" };
      if (action === "admin") {
        payload.isAdmin = !currentStatus;
        payload.isBanned = users.find(u => u.id === userId)?.is_banned || false;
      } else {
        payload.isBanned = !currentStatus;
        payload.isAdmin = users.find(u => u.id === userId)?.is_admin || false;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        loadUsers(); // Reload users to reflect changes
      } else {
        throw new Error(data.error || "Failed to update user status.");
      }
    } catch (err: any) {
      console.error("Error updating user status:", err);
      setError(err.message || "Failed to update user status.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = (userId: string, currentStatus: boolean) => handleUpdateUserStatus(userId, "ban", currentStatus);
  const handleToggleAdmin = (userId: string, currentStatus: boolean) => handleUpdateUserStatus(userId, "admin", currentStatus);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">User Command Center</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-400 text-center">Loading users...</p>}

      {!loading && filteredUsers.length === 0 && !error && (
        <p className="text-gray-400 text-center">No users found.</p>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-950 text-gray-400 text-xs uppercase font-mono">
              <tr>
                <th className="p-4">Identity</th>
                <th className="p-4">Clearance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.is_admin ? "bg-red-900" : "bg-gray-700"}`}>
                        {user.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.full_name}</div>
                        <div className="text-gray-500 text-xs font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-1 bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs border border-red-500/30 font-mono">
                        <Shield className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/30 font-mono">
                        USER
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {user.is_banned ? (
                      <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs border border-gray-600 font-mono">
                        <Ban className="w-3 h-3" /> BANNED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs border border-green-500/30 font-mono">
                        <CheckCircle className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Admin Toggle */}
                      <button 
                        onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_admin 
                            ? "text-red-400 hover:bg-red-900/20" 
                            : "text-gray-400 hover:text-red-400 hover:bg-gray-800"
                        }`}
                        title={user.is_admin ? "Revoke Admin" : "Make Admin"}
                      >
                        {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>

                      {/* Ban Toggle */}
                      <button 
                        onClick={() => handleToggleBan(user.id, user.is_banned)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_banned 
                            ? "text-green-400 hover:bg-green-900/20" 
                            : "text-gray-400 hover:text-red-500 hover:bg-gray-800"
                        }`}
                        title={user.is_banned ? "Unban User" : "Ban User"}
                      >
                        {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}