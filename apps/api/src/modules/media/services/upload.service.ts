import { GetObjectCommand } from "@aws-sdk/client-s3";
import { assets, withWorkspaceContext } from "@repo/db";
import {
  maxBytesForMimeType,
  NotFoundError,
  sanitizeStorageFilename,
  validateUploadRequest,
  ValidationError,
} from "@repo/shared";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { getEnv } from "../../../config/env";
import { getDb } from "../../../lib/db";
import {
  buildAssetStorageKey,
  createPresignedPutUrl,
  deleteStorageObject,
  getS3Client,
  headStorageObject,
} from "../../../lib/s3";
import * as assetRepo from "../repositories/asset.repository";
import * as folderRepo from "../repositories/folder.repository";

export async function createUploadRequest(
  workspaceId: string,
  userId: string,
  input: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    folderId?: string | null;
  },
) {
  validateUploadRequest(input);

  if (input.folderId) {
    const folder = await folderRepo.findMediaFolderById(
      workspaceId,
      input.folderId,
    );
    if (!folder) {
      throw new NotFoundError("Folder not found");
    }
  }

  const safeFilename = sanitizeStorageFilename(input.filename);
  const mimeType = input.mimeType.toLowerCase().trim();

  const asset = await assetRepo.createAsset(workspaceId, {
    folderId: input.folderId ?? null,
    storageKey: `pending/${workspaceId}`,
    filename: input.filename.trim(),
    mimeType,
    sizeBytes: input.sizeBytes,
    uploadedBy: userId,
  });

  const storageKey = buildAssetStorageKey(
    workspaceId,
    asset.id,
    safeFilename,
  );

  await withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    await tx
      .update(assets)
      .set({ storageKey, updatedAt: new Date() })
      .where(eq(assets.id, asset.id));
  });

  const { uploadUrl, expiresAt } = await createPresignedPutUrl(
    storageKey,
    mimeType,
  );

  return {
    assetId: asset.id,
    uploadUrl,
    storageKey,
    expiresAt: expiresAt.toISOString(),
  };
}

async function readImageDimensions(
  storageKey: string,
): Promise<{ width: number; height: number } | null> {
  const env = getEnv();
  const s3 = getS3Client();
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storageKey,
    }),
  );
  const bytes = await response.Body?.transformToByteArray();
  if (!bytes) {
    return null;
  }
  const meta = await sharp(Buffer.from(bytes)).metadata();
  if (!meta.width || !meta.height) {
    return null;
  }
  return { width: meta.width, height: meta.height };
}

export async function completeUpload(
  workspaceId: string,
  assetId: string,
) {
  const asset = await assetRepo.findAssetById(workspaceId, assetId);
  if (!asset) {
    throw new NotFoundError("Asset not found");
  }
  if (asset.status === "ready") {
    return asset;
  }
  if (asset.status === "failed") {
    throw new ValidationError("Upload failed; create a new upload request");
  }

  let head: { contentType: string | undefined; contentLength: number | undefined };
  try {
    head = await headStorageObject(asset.storageKey);
  } catch {
    await assetRepo.updateAsset(workspaceId, assetId, { status: "failed" });
    throw new ValidationError(
      "Object not found in storage; upload the file before completing",
    );
  }

  const contentLength = head.contentLength ?? 0;
  const maxBytes = maxBytesForMimeType(asset.mimeType);
  if (contentLength <= 0 || contentLength > maxBytes) {
    await assetRepo.updateAsset(workspaceId, assetId, { status: "failed" });
    throw new ValidationError("Uploaded file size is invalid");
  }

  let width: number | null = null;
  let height: number | null = null;
  if (asset.mimeType.startsWith("image/")) {
    try {
      const dims = await readImageDimensions(asset.storageKey);
      if (dims) {
        width = dims.width;
        height = dims.height;
      }
    } catch {
      // dimensions optional for MVP
    }
  }

  const updated = await assetRepo.updateAsset(workspaceId, assetId, {
    status: "ready",
    sizeBytes: contentLength,
    width,
    height,
  });

  return updated!;
}

export async function removeAsset(
  workspaceId: string,
  assetId: string,
) {
  const asset = await assetRepo.findAssetById(workspaceId, assetId);
  if (!asset) {
    throw new NotFoundError("Asset not found");
  }

  if (asset.status !== "pending") {
    try {
      await deleteStorageObject(asset.storageKey);
    } catch {
      // best-effort S3 cleanup
    }
  }

  await assetRepo.deleteAsset(workspaceId, assetId);
  return { deleted: true };
}
