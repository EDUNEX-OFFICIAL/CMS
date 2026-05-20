import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { entryStatusEnum, entries } from "./entries";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const entryVersions = pgTable(
  "entry_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    status: entryStatusEnum("status").notNull(),
    data: jsonb("data").notNull().$type<Record<string, unknown>>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    entryVersionUnique: uniqueIndex("entry_versions_entry_version_unique").on(
      table.entryId,
      table.version,
    ),
  }),
);
