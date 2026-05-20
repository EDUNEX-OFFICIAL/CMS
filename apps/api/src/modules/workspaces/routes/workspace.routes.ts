import { randomBytes } from "node:crypto";
import { Router } from "express";
import {
  ConflictError,
  NotFoundError,
  Permission,
  ValidationError,
  WorkspaceRole,
} from "@repo/shared";
import { sendSuccess } from "../../../lib/response";
import { slugify } from "../../../lib/slug";
import { validate } from "../../../middleware/validate";
import { requireAuthMiddleware } from "../../../middleware/require-auth";
import { resolveWorkspaceMiddleware } from "../../../middleware/resolve-workspace";
import { requirePermission } from "../../../middleware/require-permission";
import { getEnv } from "../../../config/env";
import { logger } from "../../../lib/logger";
import {
  reissueSessionToken,
  sessionCookieOptions,
  updateSessionWorkspace,
} from "../../../lib/session";
import { ensureDefaultContentTypes } from "../../cms/services/default-content-types.service";
import * as inviteRepo from "../repositories/invite.repository";
import * as memberRepo from "../repositories/member.repository";
import * as workspaceRepo from "../repositories/workspace.repository";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  memberIdParamSchema,
  updateMemberRoleSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} from "../validators/workspace.schema";

export const workspaceRouter = Router();

workspaceRouter.use(requireAuthMiddleware);

workspaceRouter.get("/", async (req, res, next) => {
  try {
    const workspaces = await memberRepo.listWorkspacesForUser(req.user!.id);
    sendSuccess(
      res,
      workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        role: w.role,
      })),
    );
  } catch (error) {
    next(error);
  }
});

workspaceRouter.post(
  "/",
  validate(createWorkspaceSchema),
  async (req, res, next) => {
    try {
      const name = req.body.name as string;
      let slug = (req.body.slug as string | undefined) ?? slugify(name);
      const existing = await workspaceRepo.findWorkspaceBySlug(slug);
      if (existing) {
        slug = `${slug}-${randomBytes(3).toString("hex")}`;
      }

      const workspace = await workspaceRepo.createWorkspace(name, slug);
      await memberRepo.addMember({
        workspaceId: workspace.id,
        userId: req.user!.id,
        role: WorkspaceRole.OWNER,
      });

      await ensureDefaultContentTypes(workspace.id);

      sendSuccess(
        res,
        {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          role: WorkspaceRole.OWNER,
        },
        201,
      );
    } catch (error) {
      next(error);
    }
  },
);

workspaceRouter.get(
  "/:workspaceId",
  validate(workspaceIdParamSchema, "params"),
  resolveWorkspaceMiddleware,
  requirePermission(Permission.WORKSPACE_VIEW),
  async (req, res, next) => {
    try {
      sendSuccess(res, {
        id: req.workspace!.id,
        name: req.workspace!.name,
        slug: req.workspace!.slug,
        role: req.workspace!.role,
      });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRouter.patch(
  "/:workspaceId",
  validate(workspaceIdParamSchema, "params"),
  validate(updateWorkspaceSchema),
  resolveWorkspaceMiddleware,
  requirePermission(Permission.WORKSPACE_UPDATE),
  async (req, res, next) => {
    try {
      const updated = await workspaceRepo.updateWorkspace(req.workspace!.id, {
        name: req.body.name,
        slug: req.body.slug,
      });
      if (!updated) {
        throw new NotFoundError("Workspace not found");
      }
      sendSuccess(res, {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        role: req.workspace!.role,
      });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRouter.delete(
  "/:workspaceId",
  validate(workspaceIdParamSchema, "params"),
  resolveWorkspaceMiddleware,
  requirePermission(Permission.WORKSPACE_DELETE),
  async (req, res, next) => {
    try {
      const deletedId = req.workspace!.id;
      const wasActive = req.session?.activeWorkspaceId === deletedId;

      await workspaceRepo.deleteWorkspace(deletedId);

      if (wasActive && req.session) {
        const updated = await updateSessionWorkspace(
          req.session.sessionId,
          req.user!.id,
          undefined,
        );
        if (updated) {
          const token = await reissueSessionToken(updated);
          const env = getEnv();
          res.cookie(env.SESSION_COOKIE_NAME, token, sessionCookieOptions());
        }
      }

      sendSuccess(res, { deleted: true });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRouter.get(
  "/:workspaceId/members",
  validate(workspaceIdParamSchema, "params"),
  resolveWorkspaceMiddleware,
  requirePermission(Permission.WORKSPACE_VIEW),
  async (req, res, next) => {
    try {
      const members = await memberRepo.listMembers(req.workspace!.id);
      sendSuccess(res, members);
    } catch (error) {
      next(error);
    }
  },
);

workspaceRouter.patch(
  "/:workspaceId/members/:memberId",
  validate(memberIdParamSchema, "params"),
  validate(updateMemberRoleSchema),
  resolveWorkspaceMiddleware,
  requirePermission(Permission.WORKSPACE_MEMBERS_ASSIGN_ROLE),
  async (req, res, next) => {
    try {
      const role = req.body.role as "admin" | "editor" | "viewer";
      const updated = await memberRepo.updateMemberRole(
        req.params.memberId as string,
        req.workspace!.id,
        role,
      );
      if (!updated) {
        throw new NotFoundError("Member not found");
      }
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  },
);

workspaceRouter.delete(
  "/:workspaceId/members/:memberId",
  validate(memberIdParamSchema, "params"),
  resolveWorkspaceMiddleware,
  requirePermission(Permission.WORKSPACE_MEMBERS_REMOVE),
  async (req, res, next) => {
    try {
      const memberId = req.params.memberId as string;
      if (memberId === req.workspace!.memberId) {
        throw new ValidationError("You cannot remove yourself");
      }
      const target = await memberRepo.listMembers(req.workspace!.id);
      const member = target.find((m) => m.id === memberId);
      if (!member) {
        throw new NotFoundError("Member not found");
      }
      if (member.role === WorkspaceRole.OWNER) {
        const ownerCount = await memberRepo.countOwners(req.workspace!.id);
        if (ownerCount <= 1) {
          throw new ConflictError("Cannot remove the only workspace owner");
        }
      }
      await memberRepo.removeMember(memberId, req.workspace!.id);
      sendSuccess(res, { removed: true });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRouter.post(
  "/:workspaceId/invites",
  validate(workspaceIdParamSchema, "params"),
  validate(inviteMemberSchema),
  resolveWorkspaceMiddleware,
  requirePermission(Permission.WORKSPACE_MEMBERS_INVITE),
  async (req, res, next) => {
    try {
      const email = (req.body.email as string).toLowerCase();
      const role = req.body.role as "admin" | "editor" | "viewer";
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const invite = await inviteRepo.createInvite({
        workspaceId: req.workspace!.id,
        email,
        role,
        token,
        invitedBy: req.user!.id,
        expiresAt,
      });

      const env = getEnv();
      const inviteUrl = `${env.WEB_APP_URL}/invite/${token}`;
      logger.info({ inviteUrl, email }, "Workspace invite created (dev)");

      sendSuccess(
        res,
        {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          inviteUrl,
          expiresAt: invite.expiresAt,
        },
        201,
      );
    } catch (error) {
      next(error);
    }
  },
);
