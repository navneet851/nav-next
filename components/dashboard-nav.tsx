"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/signout-button";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Organization",
    href: "/dashboard/organization",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M9 8h1" />
        <path d="M9 12h1" />
        <path d="M9 16h1" />
        <path d="M14 8h1" />
        <path d="M14 12h1" />
        <path d="M14 16h1" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      </svg>
    ),
  },
  {
    label: "Members & Roles",
    href: "/dashboard/members",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Roles & Permissions",
    href: "/dashboard/roles",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="11" r="3" />
        <path d="M12 14v4" />
      </svg>
    ),
  },
  {
    label: "Admin Panel",
    href: "/dashboard/admin",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    adminOnly: true,
  },
];

interface DashboardNavProps {
  userRole?: string | null;
}

export default function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center gap-3 border-b border-zinc-900 shrink-0">
        <svg
          className="text-white fill-current"
          viewBox="0 0 116 100"
          width="22"
          height="19"
          aria-hidden="true"
        >
          <path d="M57.5 0L115 100H0L57.5 0Z" />
        </svg>
        <span className="font-semibold text-sm tracking-tight text-white">
          NavNext
        </span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => !item.adminOnly || userRole === "admin")
          .map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-zinc-800/80 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <span
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {item.adminOnly && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
      </div>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-zinc-900 shrink-0">
        <SignOutButton />
      </div>
    </nav>
  );
}
