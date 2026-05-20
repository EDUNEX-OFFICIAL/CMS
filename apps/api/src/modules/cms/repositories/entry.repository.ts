import {
  contentTypes,
  entries,
  entryVersions,
  withWorkspaceContext,
} from "@repo/db";
import { and, desc, eq, lt, or, type SQL } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function listEntries(
  workspaceId: string,
  filters: {
    status?: "draft" | "published" | "archived";
    contentTypeId?: string;
    cursor?: string;
    limit: number;
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const conditions: SQL[] = [eq(entries.workspaceId, workspaceId)];

    if (filters.status) {
      conditions.push(eq(entries.status, filters.status));
    }
    if (filters.contentTypeId) {
      conditions.push(eq(entries.contentTypeId, filters.contentTypeId));
    }
    if (filters.cursor) {
      const [cursorEntry] = await tx
        .select()
        .from(entries)
        .where(
          and(
            eq(entries.id, filters.cursor),
            eq(entries.workspaceId, workspaceId),
          ),
        )
        .limit(1);
      if (cursorEntry) {
        conditions.push(
          or(
            lt(entries.createdAt, cursorEntry.createdAt),
            and(
              eq(entries.createdAt, cursorEntry.createdAt),
              lt(entries.id, cursorEntry.id),
            ),
          )!,
        );
      }
    }

    const rows = await tx
      .select({
        entry: entries,
        contentTypeName: contentTypes.name,
        contentTypeSlug: contentTypes.slug,
      })
      .from(entries)
      .innerJoin(contentTypes, eq(entries.contentTypeId, contentTypes.id))
      .where(and(...conditions))
      .orderBy(desc(entries.createdAt), desc(entries.id))
      .limit(filters.limit + 1);

    const hasMore = rows.length > filters.limit;
    const items = hasMore ? rows.slice(0, filters.limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]!.entry.id : null;

    return { items, nextCursor, hasMore };
  });
}

export async function findEntryById(workspaceId: string, entryId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .select()
      .from(entries)
      .where(
        and(eq(entries.id, entryId), eq(entries.workspaceId, workspaceId)),
      )
      .limit(1);
    return row ?? null;
  });
}

export async function findEntryBySlug(workspaceId: string, slug: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .select()
      .from(entries)
      .where(
        and(eq(entries.slug, slug), eq(entries.workspaceId, workspaceId)),
      )
      .limit(1);
    return row ?? null;
  });
}

export async function createEntry(
  workspaceId: string,
  data: {
    contentTypeId: string;
    slug: string;
    status?: "draft" | "published" | "archived";
    data: Record<string, unknown>;
    createdBy: string;
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .insert(entries)
      .values({
        workspaceId,
        contentTypeId: data.contentTypeId,
        slug: data.slug,
        status: data.status ?? "draft",
        data: data.data,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning();
    return row!;
  });
}

export async function updateEntry(
  workspaceId: string,
  entryId: string,
  data: {
    slug?: string;
    status?: "draft" | "published" | "archived";
    data?: Record<string, unknown>;
    updatedBy: string;
    publishedAt?: Date | null;
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .update(entries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(eq(entries.id, entryId), eq(entries.workspaceId, workspaceId)),
      )
      .returning();
    return row ?? null;
  });
}

export async function deleteEntry(workspaceId: string, entryId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .delete(entries)
      .where(
        and(eq(entries.id, entryId), eq(entries.workspaceId, workspaceId)),
      )
      .returning();
    return row ?? null;
  });
}

export async function getLatestEntryVersion(entryId: string) {
  const [row] = await getDb()
    .select()
    .from(entryVersions)
    .where(eq(entryVersions.entryId, entryId))
    .orderBy(desc(entryVersions.version))
    .limit(1);
  return row ?? null;
}

export async function createEntryVersion(
  workspaceId: string,
  data: {
    entryId: string;
    version: number;
    status: "draft" | "published" | "archived";
    data: Record<string, unknown>;
    publishedAt: Date | null;
    createdBy: string;
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .insert(entryVersions)
      .values({
        entryId: data.entryId,
        workspaceId,
        version: data.version,
        status: data.status,
        data: data.data,
        publishedAt: data.publishedAt,
        createdBy: data.createdBy,
      })
      .returning();
    return row!;
  });
}
