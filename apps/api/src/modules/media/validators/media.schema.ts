import { z } from "zod";

export const createUploadRequestSchema = z.object({
  filename: z.string().min(1).max(512),
  mimeType: z.string().min(1).max(255),
  sizeBytes: z.coerce.number().int().positive(),
  folderId: z.string().uuid().optional().nullable(),
});

export const assetIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listAssetsQuerySchema = z.object({
  folderId: z.string().uuid().optional(),
  mimeType: z.string().max(255).optional(),
  q: z.string().max(255).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const createMediaFolderSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export const updateMediaFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export const folderIdParamSchema = z.object({
  id: z.string().uuid(),
});
