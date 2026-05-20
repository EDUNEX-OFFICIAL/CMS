import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@repo/shared";

export function requireAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user || !req.session) {
    next(new UnauthorizedError());
    return;
  }
  next();
}
