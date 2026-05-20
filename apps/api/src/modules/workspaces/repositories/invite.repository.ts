import { workspaceInvites, withWorkspaceContext } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function createInvite(input: {
  workspaceId: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  token: string;
  invitedBy: string;
  expiresAt: Date;
}) {
  return withWorkspaceContext(getDb(), input.workspaceId, async (tx) => {
    const [row] = await tx.insert(workspaceInvites).values(input).returning();
    return row!;
  });
}

export async function findInviteByToken(token: string) {
  const [row] = await getDb()
    .select()
    .from(workspaceInvites)
    .where(eq(workspaceInvites.token, token))
    .limit(1);
  return row ?? null;
}

export async function markInviteAccepted(inviteId: string, workspaceId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .update(workspaceInvites)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(workspaceInvites.id, inviteId))
      .returning();
    return row ?? null;
  });
}

export async function listPendingInvites(workspaceId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    return tx
      .select()
      .from(workspaceInvites)
      .where(
        and(
          eq(workspaceInvites.workspaceId, workspaceId),
          eq(workspaceInvites.status, "pending"),
        ),
      );
  });
}
