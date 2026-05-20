import "./load-env.js";
import { createApp } from "./app";
import { getEnv } from "./config/env";
import { logger } from "./lib/logger";
import { closeDb } from "./lib/db";
import { closeRedis } from "./lib/redis";
import { closeQueue, startQueueWorker } from "./queues";
import { ensureS3Bucket } from "./lib/s3";

async function main() {
  const env = getEnv();
  const app = createApp();

  try {
    await ensureS3Bucket();
    logger.info("S3 bucket ready");
  } catch (error) {
    logger.warn(
      { err: error },
      "S3 bucket bootstrap failed; media uploads may not work until MinIO is running",
    );
  }

  const server = app.listen(env.API_PORT, () => {
    logger.info(
      { port: env.API_PORT, env: env.NODE_ENV },
      "API server listening",
    );

    try {
      startQueueWorker();
      logger.info("Queue worker started");
    } catch (error) {
      logger.warn(
        { err: error },
        "Queue worker failed to start; HTTP API still available",
      );
    }
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down API server");
    server.close(async () => {
      await closeQueue();
      await closeRedis();
      await closeDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  logger.error({ err: error }, "Failed to start API server");
  process.exit(1);
});
