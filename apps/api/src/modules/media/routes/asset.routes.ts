import { Router } from "express";
import { NotFoundError, Permission } from "@repo/shared";
import { sendSuccess } from "../../../lib/response";
import { requireAuthMiddleware } from "../../../middleware/require-auth";
import { requireWorkspaceMiddleware } from "../../../middleware/require-workspace";
import { resolveWorkspaceMiddleware } from "../../../middleware/resolve-workspace";
import { requirePermission } from "../../../middleware/require-permission";
import { validate } from "../../../middleware/validate";
import { toAssetDto } from "../lib/mappers";
import * as assetRepo from "../repositories/asset.repository";
import {
  completeUpload,
  createUploadRequest,
  removeAsset,
} from "../services/upload.service";
import {
  assetIdParamSchema,
  createUploadRequestSchema,
  listAssetsQuerySchema,
} from "../validators/media.schema";

export const assetRouter = Router();

assetRouter.use(requireAuthMiddleware);
assetRouter.use(resolveWorkspaceMiddleware);
assetRouter.use(requireWorkspaceMiddleware);

assetRouter.post(
  "/upload-requests",
  requirePermission(Permission.MEDIA_ASSETS_UPLOAD),
  validate(createUploadRequestSchema),
  async (req, res, next) => {
    try {
      const result = await createUploadRequest(
        req.workspace!.id,
        req.user!.id,
        {
          filename: req.body.filename as string,
          mimeType: req.body.mimeType as string,
          sizeBytes: req.body.sizeBytes as number,
          folderId: req.body.folderId as string | null | undefined,
        },
      );
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },
);

assetRouter.post(
  "/:id/complete",
  validate(assetIdParamSchema, "params"),
  requirePermission(Permission.MEDIA_ASSETS_UPLOAD),
  async (req, res, next) => {
    try {
      const row = await completeUpload(
        req.workspace!.id,
        req.params.id as string,
      );
      sendSuccess(res, toAssetDto(row));
    } catch (error) {
      next(error);
    }
  },
);

assetRouter.get(
  "/",
  requirePermission(Permission.MEDIA_ASSETS_VIEW),
  validate(listAssetsQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const query = req.query as {
        folderId?: string;
        mimeType?: string;
        q?: string;
        cursor?: string;
        limit?: number;
      };
      const limit = query.limit ?? 20;
      const result = await assetRepo.listAssets(req.workspace!.id, {
        folderId: query.folderId,
        mimeType: query.mimeType,
        q: query.q,
        cursor: query.cursor,
        limit,
        status: "ready",
      });

      sendSuccess(res, {
        items: result.items.map(toAssetDto),
        pagination: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

assetRouter.get(
  "/:id",
  validate(assetIdParamSchema, "params"),
  requirePermission(Permission.MEDIA_ASSETS_VIEW),
  async (req, res, next) => {
    try {
      const row = await assetRepo.findAssetById(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!row) {
        throw new NotFoundError("Asset not found");
      }
      sendSuccess(res, toAssetDto(row));
    } catch (error) {
      next(error);
    }
  },
);

assetRouter.delete(
  "/:id",
  validate(assetIdParamSchema, "params"),
  requirePermission(Permission.MEDIA_ASSETS_DELETE),
  async (req, res, next) => {
    try {
      const result = await removeAsset(
        req.workspace!.id,
        req.params.id as string,
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);
