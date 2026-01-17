"use client";

import { Shield, ShieldOff, Ban, CheckCircle, MoreHorizontal } from "lucide-react";

type UserTableProps = {
  users: any[];
  onToggleBan: (id: string, status: boolean) => void;
  onToggleAdmin: (id: string, status: boolean) => void;
};

export function UserTable({ users, onToggleBan, onToggleAdmin }: UserTableProps) {
  return (
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
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      user.is_admin ? "bg-red-900" : "bg-gray-700"
                    }`}
                  >
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
                  <button
                    onClick={() => onToggleAdmin(user.id, user.is_admin)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.is_admin
                        ? "text-red-400 hover:bg-red-900/20"
                        : "text-gray-400 hover:text-red-400 hover:bg-gray-800"
                    }`}
                    title={user.is_admin ? "Revoke Admin" : "Make Admin"}
                  >
                    {user.is_admin ? (
                      <ShieldOff className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onToggleBan(user.id, user.is_banned)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.is_banned
                        ? "text-green-400 hover:bg-green-900/20"
                        : "text-gray-400 hover:text-red-500 hover:bg-gray-800"
                    }`}
                    title={user.is_banned ? "Unban User" : "Ban User"}
                  >
                    {user.is_banned ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}