import { Queue, Worker } from "bullmq";
import { getEnv } from "../config/env";
import { getRedis } from "../lib/redis";
import { logger } from "../lib/logger";

const QUEUE_NAME = "system";

let queue: Queue | null = null;
let worker: Worker | null = null;

function queueName(): string {
  const prefix = getEnv().QUEUE_PREFIX.replace(/:/g, "-");
  return `${prefix}-${QUEUE_NAME}`;
}

export function getSystemQueue(): Queue {
  if (!queue) {
    queue = new Queue(queueName(), {
      connection: getRedis(),
    });
  }
  return queue;
}

export function startQueueWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(
    queueName(),
    async (job) => {
      logger.debug({ jobId: job.id, name: job.name }, "Processing queue job");
    },
    { connection: getRedis() },
  );

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Queue job failed");
  });

  return worker;
}

export async function checkQueueConnection(): Promise<void> {
  const q = getSystemQueue();
  await q.getJobCounts();
}

export async function closeQueue(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (queue) {
    await queue.close();
    queue = null;
  }
}
