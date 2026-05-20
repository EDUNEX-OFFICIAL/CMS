"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceRole } from "@repo/types";
import { getMe } from "@/lib/api";

export function useActiveWorkspace() {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [workspaceRole, setWorkspaceRole] = useState<WorkspaceRole | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noWorkspace, setNoWorkspace] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNoWorkspace(false);
    try {
      const result = await getMe();
      if (!result.success) {
        if (result.error.code === "UNAUTHORIZED") {
          router.push("/login");
          return;
        }
        setLoadError(result.error.message);
        setWorkspaceId(null);
        setWorkspaceName(null);
        setWorkspaceRole(null);
        setLoading(false);
        return;
      }
      const active = result.data.activeWorkspace;
      if (!active) {
        setNoWorkspace(true);
        setWorkspaceId(null);
        setWorkspaceName(null);
        setWorkspaceRole(null);
      } else {
        setWorkspaceId(active.id);
        setWorkspaceName(active.name);
        setWorkspaceRole(active.role);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load session",
      );
      setWorkspaceId(null);
      setWorkspaceName(null);
      setWorkspaceRole(null);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const error = noWorkspace
    ? "Select an active workspace on the dashboard first."
    : loadError;

  return {
    workspaceId,
    workspaceName,
    workspaceRole,
    loading,
    error,
    loadError,
    noWorkspace,
    reload: load,
  };
}
