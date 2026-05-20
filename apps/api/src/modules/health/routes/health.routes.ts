import { Router, type Router as ExpressRouter } from "express";
import { API_VERSION, APP_NAME } from "@repo/shared";
import type { HealthStatus } from "@repo/types";
import { sendSuccess } from "../../../lib/response";
import { getReadinessStatus } from "../services/readiness.service";

export const healthRouter: ExpressRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const data: HealthStatus = {
    status: "ok",
    phase: "4",
    version: API_VERSION,
  };
  sendSuccess(res, { ...data, name: APP_NAME });
});

healthRouter.get("/ready", async (_req, res) => {
  const data = await getReadinessStatus();
  const statusCode = data.status === "ok" ? 200 : 503;
  sendSuccess(res, data, statusCode);
});
