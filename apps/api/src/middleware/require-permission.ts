import type { NextFunction, Request, Response } from "express";
import {
  ForbiddenError,
  hasPermission,
  type Permission,
} from "@repo/shared";

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.workspace) {
      next(new ForbiddenError("Workspace context required"));
      return;
    }

    if (!hasPermission(req.workspace.role, permission)) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }

    next();
  };
}
