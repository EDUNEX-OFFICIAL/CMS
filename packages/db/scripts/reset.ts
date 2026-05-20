import postgres from "postgres";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/cms_dev";

async function reset() {
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    console.warn(
      "[@repo/db] Resetting development data (TRUNCATE workspace_settings, workspaces)...",
    );
    await sql`TRUNCATE TABLE workspace_settings, workspaces RESTART IDENTITY CASCADE`;
    console.log("[@repo/db] Reset completed. Run pnpm db:seed to re-seed.");
  } finally {
    await sql.end();
  }
}

reset().catch((error) => {
  console.error("[@repo/db] Reset failed:", error);
  process.exit(1);
});
