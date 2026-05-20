import { assets, withWorkspaceContext } from "@repo/db";
import { and, desc, eq, ilike, lt, or, type SQL } from "drizzle-orm";
import { getDb } from "../../../lib/db";

export async function createAsset(
  workspaceId: string,
  data: {
    folderId?: string | null;
    storageKey: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    uploadedBy?: string | null;
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .insert(assets)
      .values({
        workspaceId,
        folderId: data.folderId ?? null,
        storageKey: data.storageKey,
        filename: data.filename,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        status: "pending",
        uploadedBy: data.uploadedBy ?? null,
      })
      .returning();
    return row!;
  });
}

export async function findAssetById(workspaceId: string, assetId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .select()
      .from(assets)
      .where(
        and(eq(assets.id, assetId), eq(assets.workspaceId, workspaceId)),
      )
      .limit(1);
    return row ?? null;
  });
}

export async function listAssets(
  workspaceId: string,
  filters: {
    folderId?: string;
    mimeType?: string;
    q?: string;
    cursor?: string;
    limit: number;
    status?: "pending" | "ready" | "failed";
  },
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const conditions: SQL[] = [eq(assets.workspaceId, workspaceId)];

    if (filters.status) {
      conditions.push(eq(assets.status, filters.status));
    } else {
      conditions.push(eq(assets.status, "ready"));
    }

    if (filters.folderId) {
      conditions.push(eq(assets.folderId, filters.folderId));
    }
    if (filters.mimeType) {
      conditions.push(eq(assets.mimeType, filters.mimeType));
    }
    if (filters.q) {
      conditions.push(ilike(assets.filename, `%${filters.q}%`));
    }
    if (filters.cursor) {
      const [cursorRow] = await tx
        .select()
        .from(assets)
        .where(
          and(eq(assets.id, filters.cursor), eq(assets.workspaceId, workspaceId)),
        )
        .limit(1);
      if (cursorRow) {
        conditions.push(
          or(
            lt(assets.createdAt, cursorRow.createdAt),
            and(
              eq(assets.createdAt, cursorRow.createdAt),
              lt(assets.id, cursorRow.id),
            ),
          )!,
        );
      }
    }

    const rows = await tx
      .select()
      .from(assets)
      .where(and(...conditions))
      .orderBy(desc(assets.createdAt), desc(assets.id))
      .limit(filters.limit + 1);

    const hasMore = rows.length > filters.limit;
    const items = hasMore ? rows.slice(0, filters.limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]!.id : null;

    return { items, nextCursor, hasMore };
  });
}

export async function countAssetsInFolder(
  workspaceId: string,
  folderId: string,
): Promise<number> {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const rows = await tx
      .select({ id: assets.id })
      .from(assets)
      .where(
        and(eq(assets.workspaceId, workspaceId), eq(assets.folderId, folderId)),
      );
    return rows.length;
  });
}

export async function updateAsset(
  workspaceId: string,
  assetId: string,
  data: Partial<{
    status: "pending" | "ready" | "failed";
    sizeBytes: number;
    width: number | null;
    height: number | null;
    metadata: Record<string, unknown>;
  }>,
) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .update(assets)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(assets.id, assetId), eq(assets.workspaceId, workspaceId)),
      )
      .returning();
    return row ?? null;
  });
}

export async function deleteAsset(workspaceId: string, assetId: string) {
  return withWorkspaceContext(getDb(), workspaceId, async (tx) => {
    const [row] = await tx
      .delete(assets)
      .where(
        and(eq(assets.id, assetId), eq(assets.workspaceId, workspaceId)),
      )
      .returning();
    return row ?? null;
  });
}
