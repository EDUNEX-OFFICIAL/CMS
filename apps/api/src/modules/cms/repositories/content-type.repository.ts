import { contentTypes, withWorkspaceContext } from "@repo/db";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function listContentTypes(workspaceId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    return tx
      .select()
      .from(contentTypes)
      .where(eq(contentTypes.workspaceId, workspaceId))
      .orderBy(asc(contentTypes.name));
  });
}

export async function findContentTypeById(
  workspaceId: string,
  contentTypeId: string,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .select()
      .from(contentTypes)
      .where(
        and(
          eq(contentTypes.id, contentTypeId),
          eq(contentTypes.workspaceId, workspaceId),
        ),
      )
      .limit(1);
    return row ?? null;
  });
}

export async function findContentTypeBySlug(
  workspaceId: string,
  slug: string,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .select()
      .from(contentTypes)
      .where(
        and(
          eq(contentTypes.slug, slug),
          eq(contentTypes.workspaceId, workspaceId),
        ),
      )
      .limit(1);
    return row ?? null;
  });
}

export async function createContentType(
  workspaceId: string,
  data: {
    name: string;
    slug: string;
    description?: string | null;
    schema: { fields: unknown[] };
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .insert(contentTypes)
      .values({
        workspaceId,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        schema: data.schema,
      })
      .returning();
    return row!;
  });
}

export async function updateContentType(
  workspaceId: string,
  contentTypeId: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    schema?: { fields: unknown[] };
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .update(contentTypes)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(contentTypes.id, contentTypeId),
          eq(contentTypes.workspaceId, workspaceId),
        ),
      )
      .returning();
    return row ?? null;
  });
}

export async function deleteContentType(
  workspaceId: string,
  contentTypeId: string,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .delete(contentTypes)
      .where(
        and(
          eq(contentTypes.id, contentTypeId),
          eq(contentTypes.workspaceId, workspaceId),
        ),
      )
      .returning();
    return row ?? null;
  });
}
