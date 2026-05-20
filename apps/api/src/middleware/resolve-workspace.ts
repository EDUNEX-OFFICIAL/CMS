import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, NotFoundError } from "@repo/shared";
import { findMembership } from "../modules/workspaces/repositories/member.repository";
import { findWorkspaceById } from "../modules/workspaces/repositories/workspace.repository";

export async function resolveWorkspaceMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const workspaceId =
      (req.params.workspaceId as string | undefined) ??
      (req.headers["x-workspace-id"] as string | undefined) ??
      req.session?.activeWorkspaceId;

    if (!workspaceId || !req.user) {
      next();
      return;
    }

    const workspace = await findWorkspaceById(workspaceId);
    if (!workspace) {
      next(new NotFoundError("Workspace not found"));
      return;
    }

    const membership = await findMembership(workspaceId, req.user.id);
    if (!membership) {
      next(new ForbiddenError("You are not a member of this workspace"));
      return;
    }

    req.workspace = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      role: membership.role,
      memberId: membership.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}
