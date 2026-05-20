import { workspaceMembers, workspaces } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function findMembership(workspaceId: string, userId: string) {
  const [row] = await getDb()
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listWorkspacesForUser(userId: string) {
  return getDb()
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      role: workspaceMembers.role,
      memberId: workspaceMembers.id,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId));
}

export async function listMembers(workspaceId: string) {
  const { users } = await import("@repo/db");
  return getDb()
    .select({
      id: workspaceMembers.id,
      workspaceId: workspaceMembers.workspaceId,
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      email: users.email,
      displayName: users.displayName,
      createdAt: workspaceMembers.createdAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId));
}

export async function addMember(input: {
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "editor" | "viewer";
}) {
  const [row] = await getDb()
    .insert(workspaceMembers)
    .values(input)
    .returning();
  return row!;
}

export async function updateMemberRole(
  memberId: string,
  workspaceId: string,
  role: "owner" | "admin" | "editor" | "viewer",
) {
  const [row] = await getDb()
    .update(workspaceMembers)
    .set({ role, updatedAt: new Date() })
    .where(
      and(
        eq(workspaceMembers.id, memberId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .returning();
  return row ?? null;
}

export async function removeMember(memberId: string, workspaceId: string) {
  const [row] = await getDb()
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.id, memberId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .returning();
  return row ?? null;
}

export async function countOwners(workspaceId: string) {
  const rows = await getDb()
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.role, "owner"),
      ),
    );
  return rows.length;
}
