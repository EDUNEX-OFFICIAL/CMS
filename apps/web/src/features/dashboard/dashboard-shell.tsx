"use client";

import { APP_NAME } from "@repo/shared";

export function DashboardShell() {
  return (
    <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <span className="text-sm font-semibold text-slate-900">{APP_NAME}</span>
        <span className="text-xs text-slate-500">Admin dashboard</span>
      </div>
    </div>
  );
}
