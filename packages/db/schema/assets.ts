import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { mediaFolders } from "./media_folders";

export const assetStatusEnum = pgEnum("asset_status", [
  "pending",
  "ready",
  "failed",
]);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id").references(() => mediaFolders.id, {
      onDelete: "set null",
    }),
    storageKey: varchar("storage_key", { length: 1024 }).notNull(),
    filename: varchar("filename", { length: 512 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    sizeBytes: integer("size_bytes"),
    status: assetStatusEnum("status").notNull().default("pending"),
    width: integer("width"),
    height: integer("height"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    uploadedBy: uuid("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    workspaceIdIdx: index("assets_workspace_id_idx").on(table.workspaceId),
    workspaceFolderIdx: index("assets_workspace_folder_idx").on(
      table.workspaceId,
      table.folderId,
    ),
    workspaceStatusIdx: index("assets_workspace_status_idx").on(
      table.workspaceId,
      table.status,
    ),
  }),
);
