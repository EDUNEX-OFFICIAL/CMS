"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthMeDto, WorkspaceSummaryDto } from "@repo/types";
import { Button } from "@repo/ui";
import { AlertBanner } from "@/features/dashboard/alert-banner";
import { LoadingSkeleton } from "@/features/dashboard/loading-skeleton";
import { PageHeader } from "@/features/dashboard/page-header";
import {
  createWorkspace,
  deleteWorkspace,
  getMe,
  inviteMember,
  listWorkspaces,
  logout,
  setActiveWorkspace,
  updateWorkspace,
} from "@/lib/api";

function canEditWorkspace(role: string) {
  return role === "owner" || role === "admin";
}

export function DashboardClient() {
  const router = useRouter();
  const [me, setMe] = useState<AuthMeDto | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummaryDto[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">(
    "editor",
  );
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const meResult = await getMe();
    if (!meResult.success) {
      router.push("/login");
      return;
    }
    setMe(meResult.data);
    const wsResult = await listWorkspaces();
    if (wsResult.success) {
      setWorkspaces(wsResult.data);
    } else {
      setError(wsResult.error.message);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const result = await createWorkspace(newWorkspaceName);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setNewWorkspaceName("");
    await load();
  }

  async function onSwitchWorkspace(workspaceId: string) {
    const result = await setActiveWorkspace(workspaceId);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    await load();
  }

  function startEdit(ws: WorkspaceSummaryDto) {
    setEditingId(ws.id);
    setEditName(ws.name);
    setEditSlug(ws.slug);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setActionLoading(true);
    setError(null);
    const body: { name?: string; slug?: string } = { name: editName };
    if (editSlug.trim()) body.slug = editSlug.trim();
    const result = await updateWorkspace(editingId, body);
    setActionLoading(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    cancelEdit();
    await load();
  }

  async function onConfirmDelete(ws: WorkspaceSummaryDto) {
    const confirmed = window.confirm(
      `Delete workspace "${ws.name}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(ws.id);
    setError(null);
    const result = await deleteWorkspace(ws.id);
    setDeletingId(null);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    await load();
  }

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    const activeId = me?.activeWorkspace?.id;
    if (!activeId) {
      setError("Select an active workspace first");
      return;
    }
    const result = await inviteMember(activeId, inviteEmail, inviteRole);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setInviteUrl(result.data.inviteUrl);
    setInviteEmail("");
    setSuccess("Invite created. Share the dev link below with your teammate.");
  }

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Workspaces" description="Loading your account…" />
        <LoadingSkeleton lines={4} />
      </div>
    );
  }

  const headerDescription = me
    ? `Signed in as ${me.user.email}${
        me.activeWorkspace
          ? ` · Active: ${me.activeWorkspace.name} (${me.activeWorkspace.role})`
          : " · No active workspace"
      }`
    : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspaces"
        description={headerDescription}
        actions={
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        }
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}
      {success ? <AlertBanner variant="success">{success}</AlertBanner> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Your workspaces</h2>
        {workspaces.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No workspaces yet. Create one below — Blog Post and Page content types
            are added automatically.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {workspaces.map((ws) => (
              <li
                key={ws.id}
                className="rounded-md border border-slate-100 px-4 py-3"
              >
                {editingId === ws.id ? (
                  <form onSubmit={onSaveEdit} className="space-y-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      placeholder="Slug (optional)"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={actionLoading}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{ws.name}</p>
                      <p className="text-xs text-slate-500">
                        {ws.slug} · {ws.role}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canEditWorkspace(ws.role) ? (
                        <Button
                          variant="secondary"
                          onClick={() => startEdit(ws)}
                        >
                          Edit
                        </Button>
                      ) : null}
                      {ws.role === "owner" ? (
                        <Button
                          variant="secondary"
                          onClick={() => void onConfirmDelete(ws)}
                          disabled={deletingId === ws.id}
                        >
                          {deletingId === ws.id ? "Deleting..." : "Delete"}
                        </Button>
                      ) : null}
                      <Button
                        variant={
                          me?.activeWorkspace?.id === ws.id
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() => onSwitchWorkspace(ws.id)}
                      >
                        {me?.activeWorkspace?.id === ws.id ? "Active" : "Switch"}
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Create workspace</h2>
        <form onSubmit={onCreateWorkspace} className="mt-4 flex gap-2">
          <input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Workspace name"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <Button type="submit">Create</Button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Invite member</h2>
        <p className="mt-1 text-sm text-slate-500">
          Requires admin or owner on active workspace
        </p>
        <form onSubmit={onInvite} className="mt-4 space-y-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <select
            value={inviteRole}
            onChange={(e) =>
              setInviteRole(e.target.value as "admin" | "editor" | "viewer")
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button type="submit">Send invite</Button>
        </form>
        {inviteUrl ? (
          <p className="mt-3 break-all text-xs text-slate-600">
            Dev invite link: {inviteUrl}
          </p>
        ) : null}
      </section>
    </div>
  );
}
