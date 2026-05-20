import { contentTypeSchemaDefinition } from "@repo/shared";
import { z } from "zod";

export const createContentTypeSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  schema: contentTypeSchemaDefinition,
});

export const updateContentTypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  schema: contentTypeSchemaDefinition.optional(),
});

export const contentTypeIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createEntrySchema = z.object({
  contentTypeId: z.string().uuid(),
  slug: z.string().min(1).max(255).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  data: z.record(z.unknown()),
});

export const updateEntrySchema = z.object({
  slug: z.string().min(1).max(255).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  data: z.record(z.unknown()).optional(),
});

export const entryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listEntriesQuerySchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  contentTypeId: z.string().uuid().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
