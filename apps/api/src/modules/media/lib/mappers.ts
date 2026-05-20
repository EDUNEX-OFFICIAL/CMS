import type { AssetDto, MediaFolderDto } from "@repo/types";
import type { assets, mediaFolders } from "@repo/db";
import { getAssetPublicUrl } from "../../../lib/s3";

type AssetRow = typeof assets.$inferSelect;
type MediaFolderRow = typeof mediaFolders.$inferSelect;

export function toMediaFolderDto(row: MediaFolderRow): MediaFolderDto {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    parentId: row.parentId,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toAssetDto(row: AssetRow): AssetDto {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    folderId: row.folderId,
    storageKey: row.storageKey,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    status: row.status,
    width: row.width,
    height: row.height,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    url: row.status === "ready" ? getAssetPublicUrl(row.storageKey) : null,
    uploadedBy: row.uploadedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
