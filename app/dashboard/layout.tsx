import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardNav from "@/components/dashboard-nav";
import OrgSwitcher from "@/components/org-switcher";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string | null;

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-zinc-900 bg-zinc-950/50 backdrop-blur-sm flex flex-col fixed inset-y-0 left-0 z-40">
        <DashboardNav userRole={userRole} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-zinc-900 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <OrgSwitcher />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-white">
                {session.user.name
                  ? session.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-zinc-200 leading-tight">
                  {session.user.name}
                </p>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Background glow effects */}
          <div className="fixed top-0 left-1/3 w-[600px] h-[300px] bg-neutral-900/20 rounded-full blur-[160px] pointer-events-none" />
          <div className="fixed bottom-0 right-1/4 w-[600px] h-[300px] bg-zinc-900/15 rounded-full blur-[160px] pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
