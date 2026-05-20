import {
  checkDatabaseConnection,
  createDb,
  type Database,
  type Sql,
} from "@repo/db";
import { getEnv } from "../config/env";

let dbInstance: Database | null = null;
let sqlInstance: Sql | null = null;

export function getDb(): Database {
  if (!dbInstance) {
    const { db, sql } = createDb(getEnv().DATABASE_URL);
    dbInstance = db;
    sqlInstance = sql;
  }
  return dbInstance;
}

export function getSql(): Sql {
  if (!sqlInstance) {
    getDb();
  }
  return sqlInstance!;
}

export async function checkDbConnection(): Promise<void> {
  await checkDatabaseConnection(getSql());
}

export async function closeDb(): Promise<void> {
  if (sqlInstance) {
    await sqlInstance.end();
    sqlInstance = null;
    dbInstance = null;
  }
}
