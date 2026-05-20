import {
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { contentTypes } from "./content_types";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const entryStatusEnum = pgEnum("entry_status", [
  "draft",
  "published",
  "archived",
]);

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    contentTypeId: uuid("content_type_id")
      .notNull()
      .references(() => contentTypes.id, { onDelete: "restrict" }),
    slug: varchar("slug", { length: 255 }).notNull(),
    status: entryStatusEnum("status").notNull().default("draft"),
    data: jsonb("data").notNull().$type<Record<string, unknown>>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => users.id, {
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
    workspaceSlugUnique: uniqueIndex("entries_workspace_slug_unique").on(
      table.workspaceId,
      table.slug,
    ),
  }),
);
