import { randomBytes } from "node:crypto";
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
import { toEntryDto, toEntryListDto } from "../lib/mappers";
import * as contentTypeRepo from "../repositories/content-type.repository";
import * as entryRepo from "../repositories/entry.repository";
import { parseAndValidateEntryData } from "../services/entry-validation.service";
import type { z } from "zod";
import {
  createEntrySchema,
  entryIdParamSchema,
  listEntriesQuerySchema,
  updateEntrySchema,
} from "../validators/cms.schema";

type ListEntriesQuery = z.infer<typeof listEntriesQuerySchema>;

export const entryRouter = Router();

entryRouter.use(requireAuthMiddleware);
entryRouter.use(resolveWorkspaceMiddleware);
entryRouter.use(requireWorkspaceMiddleware);

entryRouter.get(
  "/",
  validate(listEntriesQuerySchema, "query"),
  requirePermission(Permission.CMS_ENTRIES_VIEW),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as ListEntriesQuery;

      const result = await entryRepo.listEntries(req.workspace!.id, {
        status: query.status,
        contentTypeId: query.contentTypeId,
        cursor: query.cursor,
        limit: query.limit,
      });

      sendSuccess(res, {
        items: result.items.map((row) =>
          toEntryListDto(row.entry, {
            id: row.entry.contentTypeId,
            name: row.contentTypeName,
            slug: row.contentTypeSlug,
          }),
        ),
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

entryRouter.post(
  "/",
  requirePermission(Permission.CMS_ENTRIES_CREATE),
  validate(createEntrySchema),
  async (req, res, next) => {
    try {
      const contentTypeId = req.body.contentTypeId as string;
      const contentType = await contentTypeRepo.findContentTypeById(
        req.workspace!.id,
        contentTypeId,
      );
      if (!contentType) {
        throw new NotFoundError("Content type not found");
      }

      const data = parseAndValidateEntryData(
        contentType.schema,
        req.body.data as Record<string, unknown>,
      );

      let slug =
        (req.body.slug as string | undefined) ??
        slugify(String(data.title ?? "entry"));
      const existing = await entryRepo.findEntryBySlug(req.workspace!.id, slug);
      if (existing) {
        slug = `${slug}-${randomBytes(2).toString("hex")}`;
      }

      const status = (req.body.status as "draft" | "published" | undefined) ?? "draft";
      const row = await entryRepo.createEntry(req.workspace!.id, {
        contentTypeId,
        slug,
        status,
        data,
        createdBy: req.user!.id,
      });

      sendSuccess(res, toEntryDto(row), 201);
    } catch (error) {
      next(error);
    }
  },
);

entryRouter.get(
  "/:id",
  validate(entryIdParamSchema, "params"),
  requirePermission(Permission.CMS_ENTRIES_VIEW),
  async (req, res, next) => {
    try {
      const row = await entryRepo.findEntryById(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!row) {
        throw new NotFoundError("Entry not found");
      }
      sendSuccess(res, toEntryDto(row));
    } catch (error) {
      next(error);
    }
  },
);

entryRouter.patch(
  "/:id",
  validate(entryIdParamSchema, "params"),
  validate(updateEntrySchema),
  requirePermission(Permission.CMS_ENTRIES_EDIT),
  async (req, res, next) => {
    try {
      const existing = await entryRepo.findEntryById(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!existing) {
        throw new NotFoundError("Entry not found");
      }

      const contentType = await contentTypeRepo.findContentTypeById(
        req.workspace!.id,
        existing.contentTypeId,
      );
      if (!contentType) {
        throw new NotFoundError("Content type not found");
      }

      const data = req.body.data
        ? parseAndValidateEntryData(
            contentType.schema,
            req.body.data as Record<string, unknown>,
          )
        : undefined;

      if (req.body.slug && req.body.slug !== existing.slug) {
        const slugTaken = await entryRepo.findEntryBySlug(
          req.workspace!.id,
          req.body.slug as string,
        );
        if (slugTaken) {
          throw new ConflictError("Entry slug already exists");
        }
      }

      const row = await entryRepo.updateEntry(
        req.workspace!.id,
        req.params.id as string,
        {
          slug: req.body.slug as string | undefined,
          status: req.body.status as "draft" | "published" | "archived" | undefined,
          data,
          updatedBy: req.user!.id,
          publishedAt:
            req.body.status === "published" ? new Date() : undefined,
        },
      );

      sendSuccess(res, toEntryDto(row!));
    } catch (error) {
      next(error);
    }
  },
);

entryRouter.delete(
  "/:id",
  validate(entryIdParamSchema, "params"),
  requirePermission(Permission.CMS_ENTRIES_DELETE),
  async (req, res, next) => {
    try {
      const row = await entryRepo.deleteEntry(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!row) {
        throw new NotFoundError("Entry not found");
      }
      sendSuccess(res, { deleted: true });
    } catch (error) {
      next(error);
    }
  },
);

entryRouter.post(
  "/:id/publish",
  validate(entryIdParamSchema, "params"),
  requirePermission(Permission.CMS_ENTRIES_PUBLISH),
  async (req, res, next) => {
    try {
      const existing = await entryRepo.findEntryById(
        req.workspace!.id,
        req.params.id as string,
      );
      if (!existing) {
        throw new NotFoundError("Entry not found");
      }

      const contentType = await contentTypeRepo.findContentTypeById(
        req.workspace!.id,
        existing.contentTypeId,
      );
      if (!contentType) {
        throw new NotFoundError("Content type not found");
      }

      parseAndValidateEntryData(
        contentType.schema,
        existing.data as Record<string, unknown>,
      );

      const publishedAt = new Date();
      const row = await entryRepo.updateEntry(
        req.workspace!.id,
        existing.id,
        {
          status: "published",
          updatedBy: req.user!.id,
          publishedAt,
        },
      );

      const latest = await entryRepo.getLatestEntryVersion(existing.id);
      const nextVersion = (latest?.version ?? 0) + 1;

      await entryRepo.createEntryVersion(req.workspace!.id, {
        entryId: existing.id,
        version: nextVersion,
        status: "published",
        data: existing.data as Record<string, unknown>,
        publishedAt,
        createdBy: req.user!.id,
      });

      sendSuccess(res, toEntryDto(row!));
    } catch (error) {
      next(error);
    }
  },
);
