"use client";

import React, { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: orgs, isPending: orgsLoading } = authClient.useListOrganizations();
  const { data: activeOrg, isPending: activeLoading } = authClient.useActiveOrganization();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchOrg = async (orgId: string) => {
    try {
      await authClient.organization.setActive({ organizationId: orgId });
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch organization:", error);
    }
  };

  if (orgsLoading || activeLoading) {
    return (
      <div className="h-9 w-44 rounded-lg bg-zinc-900/40 animate-pulse" />
    );
  }

  if (!orgs || orgs.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60 text-sm transition-all duration-200 cursor-pointer"
      >
        <div className="h-5 w-5 rounded bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">
          {activeOrg?.name?.[0] || "?"}
        </div>
        <span className="text-zinc-200 font-medium max-w-[120px] truncate">
          {activeOrg?.name || "Select Org"}
        </span>
        <svg
          className={`text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1.5">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => switchOrg(org.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                  activeOrg?.id === org.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
                }`}
              >
                <div className="h-6 w-6 rounded bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0">
                  {org.name[0]}
                </div>
                <span className="truncate">{org.name}</span>
                {activeOrg?.id === org.id && (
                  <svg
                    className="ml-auto text-emerald-400 shrink-0"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
