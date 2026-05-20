import type { ReactNode } from "react";
import { DashboardNav } from "@/features/dashboard/dashboard-nav";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardShell />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <DashboardNav />
        {children}
      </div>
    </div>
  );
}
