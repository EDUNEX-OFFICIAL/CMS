import { randomBytes } from "node:crypto";
import { Router } from "express";
import {
  ConflictError,
  NotFoundError,
  parseContentTypeSchema,
  Permission,
} from "@repo/shared";
import { sendSuccess } from "../../../lib/response";
import { slugify } from "../../../lib/slug";
import { requireAuthMiddleware } from "../../../middleware/require-auth";
import { requireWorkspaceMiddleware } from "../../../middleware/require-workspace";
import { resolveWorkspaceMiddleware } from "../../../middleware/resolve-workspace";
import { requirePermission } from "../../../middleware/require-permission";
import { validate } from "../../../middleware/validate";
import { toContentTypeDto } from "../lib/mappers";
import * as contentTypeRepo from "../repositories/content-type.repository";
import { ensureDefaultContentTypes } from "../services/default-content-types.service";
import {
  contentTypeIdParamSchema,
  createContentTypeSchema,
  updateContentTypeSchema,
} from "../validators/cms.schema";

export const contentTypeRouter = Router();

contentTypeRouter.use(requireAuthMiddleware);
contentTypeRouter.use(resolveWorkspaceMiddleware);
contentTypeRouter.use(requireWorkspaceMiddleware);

contentTypeRouter.post(
  "/bootstrap-defaults",
  requirePermission(Permission.CMS_CONTENT_TYPES_CREATE),
  async (req, res, next) => {
    try {
      const result = await ensureDefaultContentTypes(req.workspace!.id);
      const rows = await contentTypeRepo.listContentTypes(req.workspace!.id);
      sendSuccess(res, {
        created: result.created,
        contentTypes: rows.map(toContentTypeDto),
      });
    } catch (error) {
      next(error);
    }
  },
);

contentTypeRouter.get(
  "/",
  requirePermission(Permission.CMS_CONTENT_TYPES_VIEW),
  async (req, res, next) => {
    try {
      const rows = await contentTypeRepo.listContentTypes(req.workspace!.id);
      sendSuccess(res, rows.map(toContentTypeDto));
    } catch (error) {
      next(error);
    }
  },
);

contentTypeRouter.post(
  "/",
  requirePermission(Permission.CMS_CONTENT_TYPES_CREATE),
  validate(createContentTypeSchema),
  async (req, res, next) => {
    try {
      const name = req.body.name as string;
      let slug = (req.body.slug as string | undefined) ?? slugify(name);
      const schema = parseContentTypeSchema(req.body.schema);

      const existing = await contentTypeRepo.findContentTypeBySlug(
        req.workspace!.id,
        slug,
      );
      if (existing) {
        slug = `${slug}-${randomBytes(2).toString("hex")}`;
      }

      const row = await contentTypeRepo.createContentType(req.workspace!.id, {
        name,
        slug,
        description: req.body.description as string | null | undefined,
        schema,
      });

      sendSuccess(res, toContentTypeDto(row), 201);
    } catch (error) {
      next(error);
    }
  },
);

contentTypeRouter.get(
  "/:id",
  validate(contentTypeIdParamSchema, "params"),
  requirePermission(Permission.CMS_CONTENT_TYPES_VIEW),
  async (req, res, next) => {
    try {
      const row = await contentTypeRepo.findContentTypeById(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!row) {
        throw new NotFoundError("Content type not found");
      }
      sendSuccess(res, toContentTypeDto(row));
    } catch (error) {
      next(error);
    }
  },
);

contentTypeRouter.patch(
  "/:id",
  validate(contentTypeIdParamSchema, "params"),
  validate(updateContentTypeSchema),
  requirePermission(Permission.CMS_CONTENT_TYPES_UPDATE),
  async (req, res, next) => {
    try {
      const existing = await contentTypeRepo.findContentTypeById(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!existing) {
        throw new NotFoundError("Content type not found");
      }

      const schema = req.body.schema
        ? parseContentTypeSchema(req.body.schema)
        : undefined;

      if (req.body.slug && req.body.slug !== existing.slug) {
        const slugTaken = await contentTypeRepo.findContentTypeBySlug(
          req.workspace!.id,
          req.body.slug as string,
        );
        if (slugTaken) {
          throw new ConflictError("Content type slug already exists");
        }
      }

      const row = await contentTypeRepo.updateContentType(
        req.workspace!.id,
        req.params.id as string,
        {
          name: req.body.name as string | undefined,
          slug: req.body.slug as string | undefined,
          description: req.body.description as string | null | undefined,
          schema,
        },
      );

      sendSuccess(res, toContentTypeDto(row!));
    } catch (error) {
      next(error);
    }
  },
);

contentTypeRouter.delete(
  "/:id",
  validate(contentTypeIdParamSchema, "params"),
  requirePermission(Permission.CMS_CONTENT_TYPES_DELETE),
  async (req, res, next) => {
    try {
      const row = await contentTypeRepo.deleteContentType(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!row) {
        throw new NotFoundError("Content type not found");
      }
      sendSuccess(res, { deleted: true });
    } catch (error) {
      const pgCode =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : "";
      if (pgCode === "23503") {
        next(
          new ConflictError(
            "Cannot delete this content type while entries still reference it. Delete or reassign those entries first.",
          ),
        );
        return;
      }
      next(error);
    }
  },
);
