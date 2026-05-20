import { users } from "@repo/db";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function findUserByFirebaseUid(firebaseUid: string) {
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.firebaseUid, firebaseUid))
    .limit(1);
  return user ?? null;
}

export async function findUserById(id: string) {
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}

export async function upsertUserFromFirebase(input: {
  firebaseUid: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const existing = await findUserByFirebaseUid(input.firebaseUid);
  if (existing) {
    const [updated] = await getDb()
      .update(users)
      .set({
        email: input.email,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated!;
  }

  const [created] = await getDb()
    .insert(users)
    .values({
      firebaseUid: input.firebaseUid,
      email: input.email,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
    })
    .returning();
  return created!;
}

export function toAuthUserDto(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}
