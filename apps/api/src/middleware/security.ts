import type { RequestHandler } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { parseCorsOrigins } from "@repo/shared";
import { getEnv } from "../config/env";

export const helmetMiddleware = helmet();

export const corsMiddleware = cors({
  origin: parseCorsOrigins(getEnv().CORS_ORIGIN),
  credentials: true,
});

export const hppMiddleware: RequestHandler = hpp();

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests",
    },
  },
});

/** Reserved for Phase 2 auth routes */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
