"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { WorkspaceRole } from "@repo/types";
import { useActiveWorkspace } from "./use-active-workspace";

export function ActiveWorkspaceGate({
  children,
}: {
  children: (ctx: {
    workspaceId: string;
    workspaceName: string | null;
    workspaceRole: WorkspaceRole | null;
    reload: () => Promise<void>;
  }) => ReactNode;
}) {
  const {
    workspaceId,
    workspaceName,
    workspaceRole,
    loading,
    error,
    loadError,
    noWorkspace,
    reload,
  } = useActiveWorkspace();

  if (loading) {
    return <p className="text-slate-600">Loading workspace...</p>;
  }

  if (loadError) {
    return (
      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700" role="alert">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => void reload()}
          className="text-sm font-medium text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (noWorkspace || error || !workspaceId) {
    return (
      <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">{error}</p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-amber-900 underline"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      {children({
        workspaceId,
        workspaceName,
        workspaceRole,
        reload,
      })}
    </>
  );
}
