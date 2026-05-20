import { workspaces, withWorkspaceContext } from "@repo/db";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function createWorkspace(name: string, slug: string) {
  const [row] = await getDb()
    .insert(workspaces)
    .values({ name, slug })
    .returning();
  return row!;
}

export async function findWorkspaceById(workspaceId: string) {
  const [row] = await getDb()
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  return row ?? null;
}

export async function findWorkspaceBySlug(slug: string) {
  const [row] = await getDb()
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function updateWorkspace(
  workspaceId: string,
  data: { name?: string; slug?: string },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId))
      .returning();
    return row ?? null;
  });
}

export async function deleteWorkspace(workspaceId: string) {
  const [row] = await getDb()
    .delete(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .returning();
  return row ?? null;
}
