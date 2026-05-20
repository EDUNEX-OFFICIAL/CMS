"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AssetDto, MediaFolderDto, WorkspaceRole } from "@repo/types";
import { Button } from "@repo/ui";
import {
  createMediaFolder,
  deleteAsset,
  listAssets,
  listMediaFolders,
} from "@/lib/api";
import { AlertBanner } from "@/features/dashboard/alert-banner";
import { LoadingSkeleton } from "@/features/dashboard/loading-skeleton";
import { PageHeader } from "@/features/dashboard/page-header";
import { ActiveWorkspaceGate } from "../cms/active-workspace-gate";
import { useAssetUpload } from "./use-asset-upload";

function canUpload(role: WorkspaceRole | null) {
  return role === "owner" || role === "admin" || role === "editor";
}

function MediaLibraryInner({
  workspaceId,
  workspaceName,
  workspaceRole,
}: {
  workspaceId: string;
  workspaceName: string | null;
  workspaceRole: WorkspaceRole | null;
}) {
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [folders, setFolders] = useState<MediaFolderDto[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, error: uploadError, clearError } =
    useAssetUpload(workspaceId);

  const load = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const [assetsResult, foldersResult] = await Promise.all([
      listAssets(workspaceId, {
        folderId: selectedFolderId || undefined,
      }),
      listMediaFolders(workspaceId),
    ]);
    setListLoading(false);
    if (!assetsResult.success) {
      setListError(assetsResult.error.message);
      return;
    }
    if (!foldersResult.success) {
      setListError(foldersResult.error.message);
      return;
    }
    setAssets(assetsResult.data.items);
    setFolders(foldersResult.data);
  }, [workspaceId, selectedFolderId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    clearError();
    for (const file of Array.from(files)) {
      await uploadFile(file, selectedFolderId || null);
    }
    await load();
  }

  async function onCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const result = await createMediaFolder(workspaceId, {
      name: newFolderName.trim(),
      parentId: selectedFolderId || null,
    });
    if (!result.success) {
      setListError(result.error.message);
      return;
    }
    setNewFolderName("");
    setShowNewFolder(false);
    await load();
  }

  async function copyAssetUrl(asset: AssetDto) {
    if (!asset.url) return;
    await navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function onDeleteAsset(asset: AssetDto) {
    if (!window.confirm(`Delete "${asset.filename}"?`)) return;
    const result = await deleteAsset(workspaceId, asset.id);
    if (!result.success) {
      setListError(result.error.message);
      return;
    }
    await load();
  }

  const allowUpload = canUpload(workspaceRole);

  const uploadActions = allowUpload ? (
    <div className="flex flex-wrap gap-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,video/mp4"
        className="hidden"
        onChange={(e) => void onFilesSelected(e.target.files)}
      />
      <Button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? "Uploading..." : "Upload files"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowNewFolder((v) => !v)}
      >
        New folder
      </Button>
    </div>
  ) : (
    <span className="text-sm text-slate-500">View only (viewer role)</span>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Media"
        description={
          workspaceName
            ? `Assets for ${workspaceName}`
            : "Upload and manage workspace files"
        }
        actions={uploadActions}
      />

      {(listError || uploadError) && (
        <AlertBanner variant="error">{uploadError ?? listError}</AlertBanner>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:w-56">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Folders
          </p>
          <ul className="mt-3 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setSelectedFolderId("")}
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  !selectedFolderId
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                All assets
              </button>
            </li>
            {folders.map((folder) => (
              <li key={folder.id}>
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                    selectedFolderId === folder.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {folder.name}
                </button>
              </li>
            ))}
          </ul>
          {showNewFolder && allowUpload ? (
            <form onSubmit={onCreateFolder} className="mt-4 space-y-2">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                required
              />
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          ) : null}
        </aside>

        <section className="min-w-0 flex-1">
          {listLoading ? (
            <LoadingSkeleton lines={3} />
          ) : assets.length === 0 ? (
            <div
              className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver && allowUpload
                  ? "border-slate-900 bg-slate-100"
                  : "border-slate-300 bg-slate-50"
              }`}
              onDragOver={(e) => {
                if (!allowUpload) return;
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                if (!allowUpload) return;
                e.preventDefault();
                setDragOver(false);
                void onFilesSelected(e.dataTransfer.files);
              }}
            >
              <p className="text-sm font-medium text-slate-700">
                {allowUpload
                  ? "Drop files here or use Upload files"
                  : "No assets in this workspace"}
              </p>
              {allowUpload ? (
                <p className="mt-2 text-xs text-slate-500">
                  Images, PDF, or MP4 · max 10MB images
                </p>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <article
                  key={asset.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex aspect-video items-center justify-center bg-slate-100">
                    {asset.url && asset.mimeType.startsWith("image/") ? (
                      <img
                        src={asset.url}
                        alt={asset.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center text-xs text-slate-500">
                        {asset.mimeType}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {asset.filename}
                    </p>
                    <p className="text-xs text-slate-500">
                      {asset.sizeBytes
                        ? `${Math.round(asset.sizeBytes / 1024)} KB`
                        : "—"}
                      {asset.width && asset.height
                        ? ` · ${asset.width}×${asset.height}`
                        : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {asset.url ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void copyAssetUrl(asset)}
                        >
                          {copiedId === asset.id ? "Copied" : "Copy URL"}
                        </Button>
                      ) : null}
                      {allowUpload ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void onDeleteAsset(asset)}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function MediaLibraryClient() {
  return (
    <ActiveWorkspaceGate>
      {({ workspaceId, workspaceName, workspaceRole }) => (
        <MediaLibraryInner
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          workspaceRole={workspaceRole}
        />
      )}
    </ActiveWorkspaceGate>
  );
}
