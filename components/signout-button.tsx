"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center justify-center h-10 px-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-300 hover:text-white font-medium rounded-lg text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
          <span>Signing out...</span>
        </div>
      ) : (
        "Sign Out"
      )}
    </button>
  );
}
