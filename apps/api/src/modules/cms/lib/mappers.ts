import type { ContentTypeDto, EntryDto, EntryListDto } from "@repo/types";
import type { contentTypes, entries } from "@repo/db";

type ContentTypeRow = typeof contentTypes.$inferSelect;
type EntryRow = typeof entries.$inferSelect;

export function toContentTypeDto(row: ContentTypeRow): ContentTypeDto {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    schema: row.schema as ContentTypeDto["schema"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toEntryDto(row: EntryRow): EntryDto {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    contentTypeId: row.contentTypeId,
    slug: row.slug,
    status: row.status,
    data: row.data as Record<string, unknown>,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toEntryListDto(
  row: EntryRow,
  contentType?: { id: string; name: string; slug: string },
): EntryListDto {
  return {
    ...toEntryDto(row),
    contentType,
  };
}
