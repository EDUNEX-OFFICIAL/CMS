import { sql } from "drizzle-orm";
import type { Database } from "./client";

export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];

export async function withWorkspaceContext<T>(
  db: Database,
  workspaceId: string,
  fn: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.workspace_id', ${workspaceId}, true)`,
    );
    return fn(tx);
  });
}
