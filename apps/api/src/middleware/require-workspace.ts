import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "@repo/shared";

export function requireWorkspaceMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.workspace) {
    next(
      new ForbiddenError(
        "Active workspace required. Set X-Workspace-Id header or active workspace in session.",
      ),
    );
    return;
  }
  next();
}
