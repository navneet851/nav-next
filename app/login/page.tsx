"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(
    registered ? "Account created successfully! Please sign in below." : null
  );

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (isPending) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center p-8 border border-zinc-800 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl w-full max-w-sm text-center shadow-2xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent mx-auto" />
        <span className="text-zinc-400 text-xs mt-4 animate-pulse block">Verifying session...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Vercel-like Logomark */}
      <div className="flex justify-center mb-8">
        <svg
          className="text-white fill-current"
          viewBox="0 0 116 100"
          width="38"
          height="33"
          aria-hidden="true"
        >
          <path d="M57.5 0L115 100H0L57.5 0Z" />
        </svg>
      </div>

      {/* Card */}
      <div className="border border-zinc-800 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl transition-all duration-300">
        <div className="flex flex-col mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Sign in to your account
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="p-3.5 rounded-lg border border-emerald-950/60 bg-emerald-950/20 text-emerald-400 text-xs leading-relaxed transition-all">
              {success}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-lg border border-red-900/50 bg-red-950/20 text-red-400 text-xs leading-relaxed transition-all">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-700 transition-all duration-150 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-700 transition-all duration-150 disabled:opacity-50"
            />
          </div>

          <button
            id="submit-login"
            type="submit"
            disabled={loading}
            className="relative flex items-center justify-center w-full h-11 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-lg disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-zinc-500 font-medium">
              New to our platform?
            </span>
          </div>
        </div>

        <Link
          href="/register"
          className="flex items-center justify-center w-full h-11 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:text-white font-medium rounded-lg text-sm transition-all duration-200 active:scale-[0.99]"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="relative flex flex-col flex-1 items-center justify-center min-h-screen bg-black font-sans overflow-hidden px-4">
      {/* Background glow animations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-zinc-900/20 rounded-full blur-[80px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="relative z-10 text-zinc-400 text-sm animate-pulse">
            Loading...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
