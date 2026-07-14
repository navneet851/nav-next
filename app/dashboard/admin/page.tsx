"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: any;
  image?: string | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      const userRole = (session?.data?.user as Record<string, unknown>)
        ?.role as string | null;

      if (userRole !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      const { data, error: listError } = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      if (listError) {
        setError(listError.message || "Failed to load users");
        return;
      }

      if (data) {
        setUsers((data as unknown as { users: User[] }).users || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleBan = async (userId: string, currentlyBanned: boolean | null) => {
    setError("");
    setSuccess("");

    try {
      if (currentlyBanned) {
        const { error: unbanError } = await authClient.admin.unbanUser({
          userId,
        });
        if (unbanError) {
          setError(unbanError.message || "Failed to unban user");
          return;
        }
        setSuccess("User unbanned");
      } else {
        const { error: banError } = await authClient.admin.banUser({
          userId,
          banReason: "Banned by admin",
        });
        if (banError) {
          setError(banError.message || "Failed to ban user");
          return;
        }
        setSuccess("User banned");
      }

      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const setUserRole = async (userId: string, newRole: string) => {
    setError("");
    setSuccess("");

    try {
      const { error: roleError } = await authClient.admin.setRole({
        userId,
        role: newRole as any,
      });
      if (roleError) {
        setError(roleError.message || "Failed to update role");
        return;
      }
      setSuccess(`Role updated to "${newRole}"`);
      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="h-8 w-48 bg-zinc-900/40 rounded-lg animate-pulse" />
        <div className="h-60 bg-zinc-900/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Admin Panel
        </h1>
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-12 text-center space-y-3">
          <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-red-500/50 mx-auto">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-red-400 text-sm font-medium">Access Denied</p>
          <p className="text-zinc-600 text-xs">
            You need super admin privileges to access this panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Admin Panel
          </h1>
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Super Admin
          </span>
        </div>
        <p className="text-zinc-400 text-sm">
          System-wide user management. Ban users, assign roles, and monitor
          accounts.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" className="shrink-0">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            Total Users
          </p>
          <p className="text-2xl font-semibold text-white mt-1">
            {users.length}
          </p>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            Admins
          </p>
          <p className="text-2xl font-semibold text-amber-400 mt-1">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            Banned
          </p>
          <p className="text-2xl font-semibold text-red-400 mt-1">
            {users.filter((u) => u.banned).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-900 bg-zinc-950/40">
          <h2 className="text-sm font-semibold text-white">All Users</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-zinc-950/40 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
                        {u.name
                          ? u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "U"}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name || "—"}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role || "user"}
                      onChange={(e) => setUserRole(u.id, e.target.value)}
                      className="text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border appearance-none cursor-pointer bg-transparent focus:outline-none text-zinc-300 border-zinc-800"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.banned ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toggleBan(u.id, u.banned)}
                      className={`h-7 px-3 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        u.banned
                          ? "text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                          : "text-red-400 hover:bg-red-500/10 border border-red-500/20"
                      }`}
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
