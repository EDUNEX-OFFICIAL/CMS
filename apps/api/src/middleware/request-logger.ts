import type { RequestHandler } from "express";
import pinoHttp from "pino-http";
import { logger } from "../lib/logger";

export const requestLoggerMiddleware: RequestHandler = pinoHttp({
  logger,
  customProps: (req) => ({
    requestId: req.id != null ? String(req.id) : undefined,
  }),
}) as RequestHandler;
