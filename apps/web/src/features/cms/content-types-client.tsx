"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CmsFieldDto, CmsFieldType, ContentTypeDto } from "@repo/types";
import { Button } from "@repo/ui";
import {
  bootstrapDefaultContentTypes,
  createContentType,
  listContentTypes,
} from "@/lib/api";
import { AlertBanner } from "@/features/dashboard/alert-banner";
import { LoadingSkeleton } from "@/features/dashboard/loading-skeleton";
import { PageHeader } from "@/features/dashboard/page-header";
import { ActiveWorkspaceGate } from "./active-workspace-gate";

const FIELD_TYPES: CmsFieldType[] = [
  "text",
  "textarea",
  "richText",
  "number",
  "boolean",
  "date",
  "slug",
];

function emptyField(): CmsFieldDto {
  return { id: "title", name: "Title", type: "text", required: true };
}

function hasDuplicateFieldIds(fields: CmsFieldDto[]): boolean {
  const seen = new Set<string>();
  for (const f of fields) {
    const key = f.id.trim().toLowerCase();
    if (!key || seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function ContentTypesInner({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string | null;
}) {
  const [types, setTypes] = useState<ContentTypeDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<CmsFieldDto[]>([emptyField()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const duplicateIds = useMemo(
    () => hasDuplicateFieldIds(fields),
    [fields],
  );

  const loadTypes = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const result = await listContentTypes(workspaceId);
    setListLoading(false);
    if (!result.success) {
      setListError(result.error.message);
      return;
    }
    setTypes(result.data);
  }, [workspaceId]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  function updateField(index: number, patch: Partial<CmsFieldDto>) {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      {
        id: `field_${prev.length + 1}`,
        name: `Field ${prev.length + 1}`,
        type: "text",
        required: false,
      },
    ]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function onBootstrap() {
    setBootstrapping(true);
    setListError(null);
    const result = await bootstrapDefaultContentTypes(workspaceId);
    setBootstrapping(false);
    if (!result.success) {
      setListError(result.error.message);
      return;
    }
    setTypes(result.data.contentTypes);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (duplicateIds) {
      setFormError("Each field key must be unique.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const result = await createContentType(workspaceId, {
      name,
      schema: { fields },
    });
    setSaving(false);
    if (!result.success) {
      setFormError(result.error.message);
      return;
    }
    setTypes((prev) => [...prev, result.data]);
    setName("");
    setFields([emptyField()]);
    setShowCreate(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content types"
        description={
          workspaceName
            ? `Schemas for ${workspaceName}`
            : "Define schemas for entries in the active workspace."
        }
      />

      {listError ? <AlertBanner variant="error">{listError}</AlertBanner> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Content types</h2>
        {listLoading ? (
          <div className="mt-4">
            <LoadingSkeleton lines={2} />
          </div>
        ) : types.length === 0 ? (
          <div className="mt-4 space-y-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">
              No content types yet. New workspaces get <strong>Blog Post</strong>{" "}
              and <strong>Page</strong> automatically; existing workspaces can add
              them with one click.
            </p>
            <Button
              type="button"
              onClick={() => void onBootstrap()}
              disabled={bootstrapping}
            >
              {bootstrapping ? "Adding..." : "Add default types"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {types.map((t) => (
              <article
                key={t.id}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
              >
                <p className="font-medium text-slate-900">{t.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {t.slug} · {t.schema.fields.length} fields
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {t.schema.fields.map((f) => (
                    <span
                      key={f.id}
                      className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200"
                    >
                      {f.id} ({f.type})
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Create custom type</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Hide form" : "Show form"}
          </Button>
        </div>
        {showCreate ? (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Type name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Fields</p>
              {fields.map((field, index) => (
                <div
                  key={`${field.id}-${index}`}
                  className="grid gap-2 rounded-md border border-slate-100 p-3 sm:grid-cols-4"
                >
                  <input
                    value={field.id}
                    onChange={(e) =>
                      updateField(index, { id: e.target.value })
                    }
                    placeholder="Field key"
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    required
                  />
                  <input
                    value={field.name}
                    onChange={(e) =>
                      updateField(index, { name: e.target.value })
                    }
                    placeholder="Label"
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    required
                  />
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(index, {
                        type: e.target.value as CmsFieldType,
                      })
                    }
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={field.required ?? false}
                        onChange={(e) =>
                          updateField(index, { required: e.target.checked })
                        }
                      />
                      Required
                    </label>
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-xs text-red-600"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {duplicateIds ? (
              <p className="text-sm text-amber-700">
                Field keys must be unique before saving.
              </p>
            ) : null}
            <Button type="button" variant="secondary" onClick={addField}>
              Add field
            </Button>
            {formError ? (
              <p className="text-sm text-red-600">{formError}</p>
            ) : null}
            <Button type="submit" disabled={saving || duplicateIds}>
              {saving ? "Creating..." : "Create content type"}
            </Button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Build a custom schema when defaults are not enough.
          </p>
        )}
      </section>
    </div>
  );
}

export function ContentTypesClient() {
  return (
    <ActiveWorkspaceGate>
      {({ workspaceId, workspaceName }) => (
        <ContentTypesInner
          workspaceId={workspaceId}
          workspaceName={workspaceName}
        />
      )}
    </ActiveWorkspaceGate>
  );
}
