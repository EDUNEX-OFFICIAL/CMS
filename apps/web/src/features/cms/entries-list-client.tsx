"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ContentTypeDto, EntryListDto } from "@repo/types";
import { Button } from "@repo/ui";
import { AlertBanner } from "@/features/dashboard/alert-banner";
import { LoadingSkeleton } from "@/features/dashboard/loading-skeleton";
import { PageHeader } from "@/features/dashboard/page-header";
import { StatusBadge } from "@/features/dashboard/status-badge";
import { listContentTypes, listEntries } from "@/lib/api";
import { ActiveWorkspaceGate } from "./active-workspace-gate";

function EntriesListInner({ workspaceId }: { workspaceId: string }) {
  const [entries, setEntries] = useState<EntryListDto[]>([]);
  const [types, setTypes] = useState<ContentTypeDto[]>([]);
  const [status, setStatus] = useState<string>("");
  const [contentTypeId, setContentTypeId] = useState<string>("");
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [typesError, setTypesError] = useState<string | null>(null);

  const loadTypes = useCallback(async () => {
    const r = await listContentTypes(workspaceId);
    if (!r.success) {
      setTypesError(r.error.message);
      return;
    }
    setTypes(r.data);
    setTypesError(null);
  }, [workspaceId]);

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    const r = await listEntries(workspaceId, {
      status: status || undefined,
      contentTypeId: contentTypeId || undefined,
    });
    setEntriesLoading(false);
    if (!r.success) {
      setEntriesError(r.error.message);
      return;
    }
    setEntries(r.data.items);
  }, [workspaceId, status, contentTypeId]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const canCreate = types.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entries"
        description="Draft and published content for the active workspace."
        actions={
          canCreate ? (
            <Link href="/entries/new">
              <Button>New entry</Button>
            </Link>
          ) : (
            <Button disabled title="Create a content type first">
              New entry
            </Button>
          )
        }
      />

      {typesError ? <AlertBanner variant="error">{typesError}</AlertBanner> : null}

      {!typesError && types.length === 0 ? (
        <AlertBanner variant="warning">
          Create content types before adding entries.{" "}
          <Link href="/content-types" className="font-medium underline">
            Go to content types
          </Link>
        </AlertBanner>
      ) : null}

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={contentTypeId}
          onChange={(e) => setContentTypeId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {entriesError ? (
        <AlertBanner variant="error">{entriesError}</AlertBanner>
      ) : null}

      {entriesLoading ? (
        <LoadingSkeleton lines={4} />
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-slate-900">
                    {(entry.data?.title as string | undefined) ?? entry.slug}
                  </p>
                  <StatusBadge status={entry.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {entry.slug}
                  {entry.contentType ? ` · ${entry.contentType.name}` : ""}
                </p>
              </div>
              <Link
                href={`/entries/${entry.id}`}
                className="ml-4 shrink-0 text-sm font-medium text-slate-700 hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
          {entries.length === 0 && !entriesError ? (
            <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No entries match your filters.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

export function EntriesListClient() {
  return (
    <ActiveWorkspaceGate>
      {({ workspaceId }) => <EntriesListInner workspaceId={workspaceId} />}
    </ActiveWorkspaceGate>
  );
}
