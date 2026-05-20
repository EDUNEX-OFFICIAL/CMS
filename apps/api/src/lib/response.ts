import type { Response } from "express";
import type { ApiErrorBody, ApiSuccessResponse } from "@repo/types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  error: ApiErrorBody,
  statusCode: number,
): Response {
  return res.status(statusCode).json({ success: false, error });
}
