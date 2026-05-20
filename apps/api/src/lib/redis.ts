import IORedis from "ioredis";
import { getEnv } from "../config/env";

let client: IORedis | null = null;

export function getRedis(): IORedis {
  if (!client) {
    client = new IORedis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return client;
}

export async function checkRedisConnection(): Promise<void> {
  const redis = getRedis();
  const result = await redis.ping();
  if (result !== "PONG") {
    throw new Error("Redis ping failed");
  }
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
