import React from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const { user, session: sessionDetails } = session;
  const userRole = (user as Record<string, unknown>).role as string | null;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const sessionExpiry = sessionDetails.expiresAt
    ? new Date(sessionDetails.expiresAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

  return (
    <div className="max-w-4xl space-y-8">
      {/* Welcome */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Welcome back, {user.name || "User"}
        </h1>
        <p className="text-zinc-400 text-sm">
          Manage your organizations, members, and access controls from this
          dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="border border-zinc-900 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-semibold text-white text-xs">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-zinc-900 pt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Role</span>
              <span
                className={`font-medium ${
                  userRole === "admin" ? "text-amber-400" : "text-zinc-300"
                }`}
              >
                {userRole || "user"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Joined</span>
              <span className="text-zinc-300">{joinDate}</span>
            </div>
          </div>
        </div>

        {/* Session Card */}
        <div className="border border-zinc-900 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Session Active
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Session ID</span>
              <span
                className="text-zinc-300 font-mono truncate max-w-[120px]"
                title={sessionDetails.id}
              >
                {sessionDetails.id}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Expires</span>
              <span className="text-zinc-300 text-right">{sessionExpiry}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">IP</span>
              <span className="text-zinc-300 font-mono">
                {sessionDetails.ipAddress || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="border border-zinc-900 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <a
              href="/dashboard/organization"
              className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-zinc-900/60 transition-colors text-sm text-zinc-300 hover:text-white group"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
              >
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              </svg>
              Manage Organization
            </a>
            <a
              href="/dashboard/members"
              className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-zinc-900/60 transition-colors text-sm text-zinc-300 hover:text-white group"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              View Members
            </a>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 text-zinc-400 text-xs leading-relaxed">
        <svg
          className="text-zinc-500 shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <div>
          <span className="font-semibold text-zinc-300">
            Organization & RBAC:{" "}
          </span>
          Create organizations, invite members, assign roles (owner / admin /
          member), and manage permissions — all powered by Better Auth plugins.
        </div>
      </div>
    </div>
  );
}
