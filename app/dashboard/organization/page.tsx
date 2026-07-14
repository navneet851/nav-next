"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function OrganizationPage() {
  const { data: orgs, isPending: orgsLoading } = authClient.useListOrganizations();
  const { data: activeOrg, isPending: activeLoading } = authClient.useActiveOrganization();

  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const { data, error: createError } =
        await authClient.organization.create({
          name: name.trim(),
          slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        });

      if (createError) {
        setError(createError.message || "Failed to create organization");
        return;
      }

      if (data) {
        setSuccess(`Organization "${name}" created successfully!`);
        setName("");
        setSlug("");
        setShowForm(false);

        // Set as active
        await authClient.organization.setActive({
          organizationId: data.id,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const switchToOrg = async (orgId: string) => {
    try {
      await authClient.organization.setActive({ organizationId: orgId });
      setSuccess("Switched active organization");
      setTimeout(() => setSuccess(""), 3000);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch org");
    }
  };

  const autoSlug = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const loading = orgsLoading || activeLoading;

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="h-8 w-48 bg-zinc-900/40 rounded-lg animate-pulse" />
        <div className="h-40 bg-zinc-900/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Organizations
          </h1>
          <p className="text-zinc-400 text-sm">
            Create and manage your organizations. Each organization has its own
            members and roles.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Org
          </button>
        )}
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

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="border border-zinc-800 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-white">
            Create Organization
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => autoSlug(e.target.value)}
                placeholder="Acme Inc."
                required
                className="w-full h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="acme-inc"
                required
                className="w-full h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-white text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="h-10 px-5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Organization"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName("");
                setSlug("");
              }}
              className="h-10 px-5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Orgs List */}
      {!orgs || orgs.length === 0 ? (
        <div className="border border-zinc-900 border-dashed rounded-2xl p-12 text-center space-y-3">
          <svg
            viewBox="0 0 24 24"
            width="40"
            height="40"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            className="text-zinc-700 mx-auto"
          >
            <path d="M3 21h18" />
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            <path d="M9 8h1" />
            <path d="M9 12h1" />
            <path d="M14 8h1" />
            <path d="M14 12h1" />
          </svg>
          <p className="text-zinc-500 text-sm">No organizations yet</p>
          <p className="text-zinc-600 text-xs">
            Create your first organization to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className={`border rounded-2xl p-5 transition-all duration-200 ${
                activeOrg?.id === org.id
                  ? "border-zinc-700 bg-zinc-900/40"
                  : "border-zinc-900 bg-zinc-950/40 hover:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-sm font-bold text-white uppercase">
                    {org.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      {org.name}
                      {activeOrg?.id === org.id && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      /{org.slug}
                    </p>
                  </div>
                </div>

                {activeOrg?.id !== org.id && (
                  <button
                    onClick={() => switchToOrg(org.id)}
                    className="h-8 px-3.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-medium transition-all duration-200 cursor-pointer"
                  >
                    Set Active
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
