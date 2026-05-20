import { config } from "dotenv";
import { resolve } from "node:path";
import {
  contentTypes,
  entries,
  users,
  workspaceMembers,
  workspaceSettings,
  workspaces,
} from "../schema/index";
import { createDb } from "../src/client";

config({ path: resolve(process.cwd(), "../../.env.local") });
config({ path: resolve(process.cwd(), "../../.env") });

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/cms_dev";

async function seed() {
  const { db, sql } = createDb(databaseUrl);

  try {
    const [owner] = await db
      .insert(users)
      .values({
        firebaseUid: "seed-demo-owner",
        email: "owner@demo.cms",
        displayName: "Demo Owner",
      })
      .onConflictDoNothing({ target: users.firebaseUid })
      .returning();

    const [admin] = await db
      .insert(users)
      .values({
        firebaseUid: "seed-demo-admin",
        email: "admin@demo.cms",
        displayName: "Demo Admin",
      })
      .onConflictDoNothing({ target: users.firebaseUid })
      .returning();

    const existingUsers = await db.select().from(users);
    const ownerUser =
      owner ?? existingUsers.find((u) => u.firebaseUid === "seed-demo-owner");
    const adminUser =
      admin ?? existingUsers.find((u) => u.firebaseUid === "seed-demo-admin");

    const [alpha] = await db
      .insert(workspaces)
      .values({ name: "Alpha Agency", slug: "alpha-agency" })
      .onConflictDoNothing({ target: workspaces.slug })
      .returning();

    const [beta] = await db
      .insert(workspaces)
      .values({ name: "Beta Studio", slug: "beta-studio" })
      .onConflictDoNothing({ target: workspaces.slug })
      .returning();

    const existingWorkspaces = await db.select().from(workspaces);
    const alphaWs = alpha ?? existingWorkspaces.find((w) => w.slug === "alpha-agency");
    const betaWs = beta ?? existingWorkspaces.find((w) => w.slug === "beta-studio");

    if (alphaWs && ownerUser) {
      await db
        .insert(workspaceMembers)
        .values({
          workspaceId: alphaWs.id,
          userId: ownerUser.id,
          role: "owner",
        })
        .onConflictDoNothing({
          target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        });

      await db.insert(workspaceSettings).values({
        workspaceId: alphaWs.id,
        key: "theme",
        value: { preset: "default" },
      });
    }

    if (betaWs && ownerUser) {
      await db
        .insert(workspaceMembers)
        .values({
          workspaceId: betaWs.id,
          userId: ownerUser.id,
          role: "owner",
        })
        .onConflictDoNothing({
          target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        });
    }

    if (alphaWs && adminUser) {
      await db
        .insert(workspaceMembers)
        .values({
          workspaceId: alphaWs.id,
          userId: adminUser.id,
          role: "admin",
        })
        .onConflictDoNothing({
          target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        });
    }

    if (betaWs) {
      await db.insert(workspaceSettings).values({
        workspaceId: betaWs.id,
        key: "theme",
        value: { preset: "dark" },
      });
    }

    if (alphaWs) {
      const blogSchema = {
        fields: [
          { id: "title", name: "Title", type: "text", required: true },
          { id: "body", name: "Body", type: "richText", required: false },
        ],
      };

      const [blogType] = await db
        .insert(contentTypes)
        .values({
          workspaceId: alphaWs.id,
          name: "Blog Post",
          slug: "blog",
          description: "Blog articles",
          schema: blogSchema,
        })
        .onConflictDoNothing({
          target: [contentTypes.workspaceId, contentTypes.slug],
        })
        .returning();

      const existingTypes = await db.select().from(contentTypes);
      const blog =
        blogType ??
        existingTypes.find(
          (t) => t.workspaceId === alphaWs.id && t.slug === "blog",
        );

      if (blog && ownerUser) {
        await db
          .insert(entries)
          .values({
            workspaceId: alphaWs.id,
            contentTypeId: blog.id,
            slug: "welcome-post",
            status: "published",
            data: {
              title: "Welcome to CMS",
              body: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Hello from seed data." }],
                  },
                ],
              },
            },
            publishedAt: new Date(),
            createdBy: ownerUser.id,
            updatedBy: ownerUser.id,
          })
          .onConflictDoNothing({
            target: [entries.workspaceId, entries.slug],
          });

        await db
          .insert(entries)
          .values({
            workspaceId: alphaWs.id,
            contentTypeId: blog.id,
            slug: "draft-ideas",
            status: "draft",
            data: {
              title: "Draft ideas",
              body: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Work in progress." }],
                  },
                ],
              },
            },
            createdBy: ownerUser.id,
            updatedBy: ownerUser.id,
          })
          .onConflictDoNothing({
            target: [entries.workspaceId, entries.slug],
          });
      }
    }

    console.log("[@repo/db] Seed completed.");
  } finally {
    await sql.end();
  }
}

seed().catch((error) => {
  console.error("[@repo/db] Seed failed:", error);
  process.exit(1);
});
