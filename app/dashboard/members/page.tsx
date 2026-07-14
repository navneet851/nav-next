"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface DynamicRole {
  id: string;
  role: string;
  permission: Record<string, string[]>;
}

export default function MembersPage() {
  const { data: activeOrg, isPending: activeLoading } = authClient.useActiveOrganization();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [dynamicRoles, setDynamicRoles] = useState<DynamicRole[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (activeOrg) {
      authClient.organization
        .listRoles({ query: { organizationId: activeOrg.id } })
        .then(({ data }) => {
          if (data) setDynamicRoles(data as unknown as DynamicRole[]);
        })
        .catch((err) => console.error("Error fetching dynamic roles:", err));
    }
  }, [activeOrg?.id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setError("");
    setSuccess("");
    setInviting(true);

    try {
      const { error: inviteError } =
        await authClient.organization.inviteMember({
          email: inviteEmail.trim(),
          role: inviteRole as any,
          organizationId: activeOrg.id,
        });

      if (inviteError) {
        setError(inviteError.message || "Failed to invite member");
        return;
      }

      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setInviting(false);
    }
  };

  const updateRole = async (memberId: string, newRole: string) => {
    if (!activeOrg) return;
    setError("");
    setSuccess("");

    try {
      const { error: updateError } =
        await authClient.organization.updateMemberRole({
          memberId,
          role: newRole as any,
          organizationId: activeOrg.id,
        });

      if (updateError) {
        setError(updateError.message || "Failed to update role");
        return;
      }

      setSuccess("Role updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!activeOrg) return;
    setError("");

    try {
      const { error: removeError } =
        await authClient.organization.removeMember({
          memberIdOrEmail: memberId,
          organizationId: activeOrg.id,
        });

      if (removeError) {
        setError(removeError.message || "Failed to remove member");
        return;
      }

      setSuccess("Member removed");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (activeLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="h-8 w-48 bg-zinc-900/40 rounded-lg animate-pulse" />
        <div className="h-40 bg-zinc-900/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Members & Roles
        </h1>
        <div className="border border-zinc-900 border-dashed rounded-2xl p-12 text-center space-y-3">
          <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-zinc-700 mx-auto">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <p className="text-zinc-500 text-sm">No active organization</p>
          <p className="text-zinc-600 text-xs">
            Create or select an organization from the{" "}
            <a
              href="/dashboard/organization"
              className="text-zinc-400 underline hover:text-white transition-colors"
            >
              Organization page
            </a>{" "}
            first.
          </p>
        </div>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    owner: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    admin: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    member: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    user: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  };

  const getRoleClass = (role: string) => {
    return roleColors[role] || "text-purple-400 bg-purple-500/10 border-purple-500/20";
  };

  const members = activeOrg.members || [];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Members & Roles
          </h1>
          <span className="text-xs font-mono text-zinc-500 px-2 py-0.5 rounded-md border border-zinc-900 bg-zinc-950">
            {activeOrg.name}
          </span>
        </div>
        <p className="text-zinc-400 text-sm">
          Manage members and assign roles within your organization.
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

      {/* Invite Form */}
      <form
        onSubmit={handleInvite}
        className="border border-zinc-800 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-5"
      >
        <h2 className="text-sm font-semibold text-white mb-4">
          Invite Member
        </h2>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
            />
          </div>
          <div className="w-44 space-y-1.5">
            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="member">Member (default)</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              {dynamicRoles.map((r) => (
                <option key={r.id} value={r.role}>
                  {r.role} (custom)
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            className="h-10 px-5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {inviting ? (
              <span className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                Sending...
              </span>
            ) : (
              "Send Invite"
            )}
          </button>
        </div>
      </form>

      {/* Members Table */}
      <div className="border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-900 bg-zinc-950/40 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Members ({members.length})
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No members yet. Invite someone to get started.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {members.map((member) => (
              <div
                key={member.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-white">
                    {member.user.name
                      ? member.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {member.user.name || "Unknown"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Badge / Selector */}
                  {member.role === "owner" ? (
                    <span
                      className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border ${getRoleClass(member.role)}`}
                    >
                      {member.role}
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(e) => updateRole(member.id, e.target.value)}
                      className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border appearance-none cursor-pointer bg-transparent focus:outline-none ${getRoleClass(
                        member.role
                      )}`}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      {dynamicRoles.map((r) => (
                        <option key={r.id} value={r.role}>
                          {r.role}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Remove button (not for owners) */}
                  {member.role !== "owner" && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Remove member"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
