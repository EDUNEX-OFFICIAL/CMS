import type { ReadinessCheck, ReadinessStatus } from "@repo/types";
import { checkDbConnection } from "../../../lib/db";
import { checkRedisConnection } from "../../../lib/redis";
import { checkQueueConnection } from "../../../queues";
import { checkS3Connection } from "../../../lib/s3";

async function runCheck(
  name: string,
  fn: () => Promise<void>,
): Promise<ReadinessCheck> {
  try {
    await fn();
    return { name, status: "ok" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check failed";
    return { name, status: "error", message };
  }
}

export async function getReadinessStatus(): Promise<ReadinessStatus> {
  const checks = await Promise.all([
    runCheck("postgres", checkDbConnection),
    runCheck("redis", checkRedisConnection),
    runCheck("queue", checkQueueConnection),
    runCheck("s3", checkS3Connection),
  ]);

  const hasError = checks.some((c) => c.status === "error");
  return {
    status: hasError ? "degraded" : "ok",
    checks,
  };
}
