import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ErrorCode, InternalError, ValidationError, isAppError } from "@repo/shared";
import { logger } from "../lib/logger";
import { sendError } from "../lib/response";

export function errorHandlerMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const correlationId = req.id != null ? String(req.id) : undefined;

  if (error instanceof ZodError) {
    const appError = new ValidationError("Validation failed", error.flatten());
    sendError(
      res,
      {
        code: appError.code,
        message: appError.message,
        details: appError.details,
        correlationId,
      },
      appError.statusCode,
    );
    return;
  }

  if (isAppError(error)) {
    if (error.statusCode >= 500) {
      logger.error({ err: error, requestId: correlationId }, error.message);
    }
    sendError(
      res,
      {
        code: error.code,
        message: error.message,
        details: error.details,
        correlationId,
      },
      error.statusCode,
    );
    return;
  }

  logger.error({ err: error, requestId: correlationId }, "Unhandled error");
  const internal = new InternalError();
  sendError(
    res,
    {
      code: ErrorCode.INTERNAL_ERROR,
      message: internal.message,
      correlationId,
    },
    internal.statusCode,
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    {
      code: ErrorCode.NOT_FOUND,
      message: `Route not found: ${req.method} ${req.path}`,
      correlationId: req.id != null ? String(req.id) : undefined,
    },
    404,
  );
}
