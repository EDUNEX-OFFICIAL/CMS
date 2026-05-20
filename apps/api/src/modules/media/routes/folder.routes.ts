import { Router } from "express";
import {
  ConflictError,
  NotFoundError,
  Permission,
} from "@repo/shared";
import { sendSuccess } from "../../../lib/response";
import { slugify } from "../../../lib/slug";
import { requireAuthMiddleware } from "../../../middleware/require-auth";
import { requireWorkspaceMiddleware } from "../../../middleware/require-workspace";
import { resolveWorkspaceMiddleware } from "../../../middleware/resolve-workspace";
import { requirePermission } from "../../../middleware/require-permission";
import { validate } from "../../../middleware/validate";
import { toMediaFolderDto } from "../lib/mappers";
import * as assetRepo from "../repositories/asset.repository";
import * as folderRepo from "../repositories/folder.repository";
import {
  createMediaFolderSchema,
  folderIdParamSchema,
  updateMediaFolderSchema,
} from "../validators/media.schema";

export const mediaFolderRouter = Router();

mediaFolderRouter.use(requireAuthMiddleware);
mediaFolderRouter.use(resolveWorkspaceMiddleware);
mediaFolderRouter.use(requireWorkspaceMiddleware);

mediaFolderRouter.get(
  "/",
  requirePermission(Permission.MEDIA_ASSETS_VIEW),
  async (req, res, next) => {
    try {
      const rows = await folderRepo.listMediaFolders(req.workspace!.id);
      sendSuccess(res, rows.map(toMediaFolderDto));
    } catch (error) {
      next(error);
    }
  },
);

mediaFolderRouter.post(
  "/",
  requirePermission(Permission.MEDIA_FOLDERS_ORGANIZE),
  validate(createMediaFolderSchema),
  async (req, res, next) => {
    try {
      const name = req.body.name as string;
      const slug = (req.body.slug as string | undefined) ?? slugify(name);
      const parentId = (req.body.parentId as string | null | undefined) ?? null;

      if (parentId) {
        const parent = await folderRepo.findMediaFolderById(
          req.workspace!.id,
          parentId,
        );
        if (!parent) {
          throw new NotFoundError("Parent folder not found");
        }
      }

      const existing = await folderRepo.findMediaFolderBySlug(
        req.workspace!.id,
        parentId,
        slug,
      );
      if (existing) {
        throw new ConflictError("A folder with this slug already exists here");
      }

      const row = await folderRepo.createMediaFolder(req.workspace!.id, {
        name,
        slug,
        parentId,
      });
      sendSuccess(res, toMediaFolderDto(row), 201);
    } catch (error) {
      next(error);
    }
  },
);

mediaFolderRouter.patch(
  "/:id",
  validate(folderIdParamSchema, "params"),
  requirePermission(Permission.MEDIA_FOLDERS_ORGANIZE),
  validate(updateMediaFolderSchema),
  async (req, res, next) => {
    try {
      const folderId = req.params.id as string;
      const existing = await folderRepo.findMediaFolderById(
        req.workspace!.id,
        folderId,
      );
      if (!existing) {
        throw new NotFoundError("Folder not found");
      }

      const slug = req.body.slug as string | undefined;
      const parentId = req.body.parentId as string | null | undefined;

      if (slug && slug !== existing.slug) {
        const targetParent =
          parentId !== undefined ? parentId : existing.parentId;
        const conflict = await folderRepo.findMediaFolderBySlug(
          req.workspace!.id,
          targetParent,
          slug,
        );
        if (conflict && conflict.id !== folderId) {
          throw new ConflictError("A folder with this slug already exists here");
        }
      }

      const row = await folderRepo.updateMediaFolder(
        req.workspace!.id,
        folderId,
        {
          name: req.body.name as string | undefined,
          slug,
          parentId:
            parentId !== undefined ? parentId : undefined,
        },
      );
      sendSuccess(res, toMediaFolderDto(row!));
    } catch (error) {
      next(error);
    }
  },
);

mediaFolderRouter.delete(
  "/:id",
  validate(folderIdParamSchema, "params"),
  requirePermission(Permission.MEDIA_FOLDERS_ORGANIZE),
  async (req, res, next) => {
    try {
      const folderId = req.params.id as string;
      const existing = await folderRepo.findMediaFolderById(
        req.workspace!.id,
        folderId,
      );
      if (!existing) {
        throw new NotFoundError("Folder not found");
      }

      const assetCount = await assetRepo.countAssetsInFolder(
        req.workspace!.id,
        folderId,
      );
      if (assetCount > 0) {
        throw new ConflictError(
          "Cannot delete folder while it contains assets. Move or delete assets first.",
        );
      }

      const childCount = await folderRepo.countChildFolders(
        req.workspace!.id,
        folderId,
      );
      if (childCount > 0) {
        throw new ConflictError(
          "Cannot delete folder while it has subfolders. Remove subfolders first.",
        );
      }

      await folderRepo.deleteMediaFolder(req.workspace!.id, folderId);
      sendSuccess(res, { deleted: true });
    } catch (error) {
      next(error);
    }
  },
);
