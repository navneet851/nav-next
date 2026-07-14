"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

interface ActiveOrg {
  id: string;
  name: string;
  slug: string;
}

interface DynamicRole {
  id: string;
  role: string;
  permission: Record<string, string[]>;
  createdAt: string;
}

export default function RolesPage() {
  const { data: activeOrg, isPending: activeLoading } = authClient.useActiveOrganization();

  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({
    deliveryJob: [],
    member: [],
    userAccount: [],
  });

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRoles = useCallback(async () => {
    if (!activeOrg?.id) return;
    try {
      const { data, error: listError } = await authClient.organization.listRoles({
        query: { organizationId: activeOrg.id },
      });

      if (listError) {
        setError(listError.message || "Failed to load roles");
        return;
      }

      if (data) {
        setRoles(data as unknown as DynamicRole[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred loading roles");
    } finally {
      setLoading(false);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    if (activeOrg?.id) {
      loadRoles();
    } else {
      setLoading(false);
    }
  }, [activeOrg?.id, loadRoles]);

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setPermissions((prev) => {
      const currentActions = prev[resource] || [];
      const nextActions = checked
        ? [...currentActions, action]
        : currentActions.filter((a) => a !== action);
      return {
        ...prev,
        [resource]: nextActions,
      };
    });
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    if (!roleName.trim()) return;

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const formattedRole = roleName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
      const { data, error: createError } = await authClient.organization.createRole({
        role: formattedRole,
        permission: permissions,
        organizationId: activeOrg.id,
      });

      if (createError) {
        setError(createError.message || "Failed to create role");
        return;
      }

      setSuccess(`Dynamic role "${formattedRole}" created successfully!`);
      setRoleName("");
      setPermissions({
        deliveryJob: [],
        member: [],
        userAccount: [],
      });
      loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred creating role");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!activeOrg) return;
    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await authClient.organization.deleteRole({
        roleId,
        organizationId: activeOrg.id,
      });

      if (deleteError) {
        setError(deleteError.message || "Failed to delete role");
        return;
      }

      setSuccess("Role deleted successfully");
      loadRoles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred deleting role");
    }
  };

  if (activeLoading || (loading && activeOrg)) {
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
          Roles & Permissions
        </h1>
        <div className="border border-zinc-900 border-dashed rounded-2xl p-12 text-center space-y-3">
          <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-zinc-700 mx-auto">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-zinc-500 text-sm">No active organization</p>
          <p className="text-zinc-600 text-xs">
            Select or create an organization first to manage dynamic roles.
          </p>
        </div>
      </div>
    );
  }

  const resources = [
    { key: "deliveryJob", name: "Delivery Jobs", actions: ["create", "read", "update", "delete"] },
    { key: "member", name: "Members Management", actions: ["create", "read", "update", "delete"] },
    { key: "userAccount", name: "User Account Details", actions: ["create", "read", "update", "delete"] },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Roles & Permissions
          </h1>
          <span className="text-xs font-mono text-zinc-500 px-2 py-0.5 rounded-md border border-zinc-900 bg-zinc-950">
            {activeOrg.name}
          </span>
        </div>
        <p className="text-zinc-400 text-sm">
          Define dynamic organization-level roles and control granular resource permissions.
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

      {/* Create Role Box */}
      <form
        onSubmit={handleCreateRole}
        className="border border-zinc-800 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-6 space-y-6"
      >
        <h2 className="text-sm font-semibold text-white">
          Create Dynamic Role
        </h2>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Role Name / Identifier
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="driver"
            required
            className="w-full max-w-sm h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Resources Config */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Resource Access Matrix
          </h3>

          <div className="border border-zinc-900 rounded-xl overflow-hidden divide-y divide-zinc-900 bg-zinc-950/20">
            {resources.map((res) => (
              <div key={res.key} className="p-4 sm:flex items-center justify-between gap-4">
                <div className="mb-2 sm:mb-0">
                  <p className="text-sm font-medium text-white">{res.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{res.key}</p>
                </div>
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  {res.actions.map((act) => {
                    const isChecked = (permissions[res.key] || []).includes(act);
                    return (
                      <label key={act} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handlePermissionChange(res.key, act, e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-white focus:ring-zinc-600 focus:ring-offset-0 focus:ring-2 accent-white"
                        />
                        <span className="text-xs text-zinc-400 hover:text-white capitalize transition-colors">
                          {act}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={creating || !roleName.trim()}
          className="h-10 px-5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {creating ? "Creating..." : "Save Dynamic Role"}
        </button>
      </form>

      {/* Role list */}
      <div className="border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-900 bg-zinc-950/40">
          <h2 className="text-sm font-semibold text-white">Dynamic Roles</h2>
        </div>

        {roles.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No dynamic roles defined yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {roles.map((r) => (
              <div key={r.id} className="p-5 sm:flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white font-mono">{r.role}</span>
                    <span className="text-[10px] text-zinc-500">
                      ID: {r.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(r.permission).map(([res, actions]) => (
                      <div key={res} className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-500 font-mono">{res}:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {actions.map((act) => (
                            <span
                              key={act}
                              className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 sm:mt-0">
                  <button
                    onClick={() => handleDeleteRole(r.id)}
                    className="h-8 px-3 rounded-lg border border-zinc-850 hover:border-red-500/30 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 text-xs font-medium transition-all cursor-pointer"
                  >
                    Delete Role
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
