"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CmsFieldDto, ContentTypeDto, EntryDto } from "@repo/types";
import { Button } from "@repo/ui";
import {
  createEntry,
  getEntry,
  listContentTypes,
  publishEntry,
  updateEntry,
} from "@/lib/api";
import { RichTextEditor } from "./rich-text-editor";
import { AlertBanner } from "@/features/dashboard/alert-banner";
import { PageHeader } from "@/features/dashboard/page-header";
import { StatusBadge } from "@/features/dashboard/status-badge";
import { ActiveWorkspaceGate } from "./active-workspace-gate";

function defaultDataForFields(fields: CmsFieldDto[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.type) {
      case "boolean":
        data[field.id] = false;
        break;
      case "number":
        data[field.id] = 0;
        break;
      case "richText":
        data[field.id] = {
          type: "doc",
          content: [{ type: "paragraph" }],
        };
        break;
      default:
        data[field.id] = "";
    }
  }
  return data;
}

type EntryFormClientProps = {
  entryId?: string;
};

function EntryFormInner({
  workspaceId,
  entryId,
}: {
  workspaceId: string;
  entryId?: string;
}) {
  const router = useRouter();
  const [types, setTypes] = useState<ContentTypeDto[]>([]);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [contentTypeId, setContentTypeId] = useState("");
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [entry, setEntry] = useState<EntryDto | null>(null);
  const [entryLoadError, setEntryLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dataDirtyRef = useRef(false);

  const selectedType = types.find((t) => t.id === contentTypeId);

  useEffect(() => {
    void listContentTypes(workspaceId).then((r) => {
      if (!r.success) {
        setTypesError(r.error.message);
        return;
      }
      setTypes(r.data);
      if (!entryId && r.data[0]) {
        setContentTypeId(r.data[0].id);
        setData(defaultDataForFields(r.data[0].schema.fields));
      }
    });
  }, [workspaceId, entryId]);

  useEffect(() => {
    if (!entryId) return;
    setEntryLoadError(null);
    void getEntry(workspaceId, entryId).then((r) => {
      if (!r.success) {
        setEntryLoadError(r.error.message);
        return;
      }
      setEntry(r.data);
      setContentTypeId(r.data.contentTypeId);
      setSlug(r.data.slug);
      setData(r.data.data);
      dataDirtyRef.current = true;
    });
  }, [workspaceId, entryId]);

  useEffect(() => {
    if (entryId || !selectedType || dataDirtyRef.current) return;
    setData(defaultDataForFields(selectedType.schema.fields));
  }, [contentTypeId, selectedType, entryId]);

  function onContentTypeChange(nextId: string) {
    setContentTypeId(nextId);
    if (entryId || dataDirtyRef.current) return;
    const nextType = types.find((t) => t.id === nextId);
    if (nextType) {
      setData(defaultDataForFields(nextType.schema.fields));
    }
  }

  function setFieldValue(fieldId: string, value: unknown) {
    dataDirtyRef.current = true;
    setData((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!contentTypeId) return;
    setSaving(true);
    setFormError(null);

    const result = entryId
      ? await updateEntry(workspaceId, entryId, { slug: slug || undefined, data })
      : await createEntry(workspaceId, {
          contentTypeId,
          slug: slug || undefined,
          data,
        });

    setSaving(false);
    if (!result.success) {
      setFormError(result.error.message);
      return;
    }
    if (!entryId) {
      router.push(`/entries/${result.data.id}`);
    } else {
      setEntry(result.data);
    }
  }

  async function onPublish() {
    if (!entryId) return;
    setSaving(true);
    const result = await publishEntry(workspaceId, entryId);
    setSaving(false);
    if (!result.success) {
      setFormError(result.error.message);
      return;
    }
    setEntry(result.data);
  }

  if (entryLoadError) {
    return (
      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{entryLoadError}</p>
        <Link href="/entries" className="text-sm font-medium text-red-800 underline">
          Back to entries
        </Link>
      </div>
    );
  }

  if (typesError) {
    return <p className="text-red-600">{typesError}</p>;
  }

  if (!entryId && types.length === 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No content types in this workspace.{" "}
        <Link href="/content-types" className="font-medium underline">
          Add content types
        </Link>{" "}
        first.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title={entryId ? "Edit entry" : "New entry"}
        description={
          entry
            ? entry.publishedAt
              ? `Published ${new Date(entry.publishedAt).toLocaleString()}`
              : "Draft entry"
            : "Fill in fields and save as draft."
        }
        actions={
          <div className="flex items-center gap-2">
            {entry ? <StatusBadge status={entry.status} /> : null}
            <Link
              href="/entries"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Back to entries
            </Link>
          </div>
        }
      />

      <form
        id="entry-form"
        onSubmit={onSave}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {!entryId ? (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Content type
            </label>
            <select
              value={contentTypeId}
              onChange={(e) => onContentTypeChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-slate-700">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="auto from title if empty"
          />
        </div>

        {selectedType?.schema.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-slate-700">
              {field.name}
              {field.required ? " *" : ""}
            </label>
            {field.type === "richText" ? (
              <div className="mt-1">
                <RichTextEditor
                  value={(data[field.id] as Record<string, unknown>) ?? null}
                  onChange={(v) => setFieldValue(field.id, v)}
                />
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                value={String(data[field.id] ?? "")}
                onChange={(e) => setFieldValue(field.id, e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows={4}
              />
            ) : field.type === "boolean" ? (
              <input
                type="checkbox"
                checked={Boolean(data[field.id])}
                onChange={(e) => setFieldValue(field.id, e.target.checked)}
                className="mt-2"
              />
            ) : field.type === "number" ? (
              <input
                type="number"
                value={Number(data[field.id] ?? 0)}
                onChange={(e) =>
                  setFieldValue(field.id, Number(e.target.value))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            ) : (
              <input
                type={field.type === "date" ? "date" : "text"}
                value={String(data[field.id] ?? "")}
                onChange={(e) => setFieldValue(field.id, e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required={field.required}
              />
            )}
          </div>
        ))}

        {formError ? <AlertBanner variant="error">{formError}</AlertBanner> : null}
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2">
          <Button type="submit" form="entry-form" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          {entryId && entry?.status !== "published" ? (
            <Button type="button" variant="secondary" onClick={onPublish} disabled={saving}>
              Publish
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EntryFormClient({ entryId }: EntryFormClientProps) {
  return (
    <ActiveWorkspaceGate>
      {({ workspaceId }) => (
        <EntryFormInner workspaceId={workspaceId} entryId={entryId} />
      )}
    </ActiveWorkspaceGate>
  );
}
