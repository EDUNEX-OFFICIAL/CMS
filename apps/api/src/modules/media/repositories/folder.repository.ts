import { mediaFolders, withWorkspaceContext } from "@repo/db";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function listMediaFolders(workspaceId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    return tx
      .select()
      .from(mediaFolders)
      .where(eq(mediaFolders.workspaceId, workspaceId))
      .orderBy(asc(mediaFolders.name));
  });
}

export async function findMediaFolderById(
  workspaceId: string,
  folderId: string,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .select()
      .from(mediaFolders)
      .where(
        and(
          eq(mediaFolders.id, folderId),
          eq(mediaFolders.workspaceId, workspaceId),
        ),
      )
      .limit(1);
    return row ?? null;
  });
}

export async function findMediaFolderBySlug(
  workspaceId: string,
  parentId: string | null,
  slug: string,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const parentCondition = parentId
      ? eq(mediaFolders.parentId, parentId)
      : isNull(mediaFolders.parentId);
    const [row] = await tx
      .select()
      .from(mediaFolders)
      .where(
        and(
          eq(mediaFolders.workspaceId, workspaceId),
          parentCondition,
          eq(mediaFolders.slug, slug),
        ),
      )
      .limit(1);
    return row ?? null;
  });
}

export async function createMediaFolder(
  workspaceId: string,
  data: { name: string; slug: string; parentId?: string | null },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .insert(mediaFolders)
      .values({
        workspaceId,
        name: data.name,
        slug: data.slug,
        parentId: data.parentId ?? null,
      })
      .returning();
    return row!;
  });
}

export async function updateMediaFolder(
  workspaceId: string,
  folderId: string,
  data: Partial<{
    name: string;
    slug: string;
    parentId: string | null;
  }>,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .update(mediaFolders)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(mediaFolders.id, folderId),
          eq(mediaFolders.workspaceId, workspaceId),
        ),
      )
      .returning();
    return row ?? null;
  });
}

export async function deleteMediaFolder(
  workspaceId: string,
  folderId: string,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .delete(mediaFolders)
      .where(
        and(
          eq(mediaFolders.id, folderId),
          eq(mediaFolders.workspaceId, workspaceId),
        ),
      )
      .returning();
    return row ?? null;
  });
}

export async function countChildFolders(
  workspaceId: string,
  folderId: string,
): Promise<number> {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const rows = await tx
      .select({ id: mediaFolders.id })
      .from(mediaFolders)
      .where(
        and(
          eq(mediaFolders.workspaceId, workspaceId),
          eq(mediaFolders.parentId, folderId),
        ),
      );
    return rows.length;
  });
}
