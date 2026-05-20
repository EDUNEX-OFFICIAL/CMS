import { Router } from "express";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@repo/shared";
import { sendSuccess } from "../../../lib/response";
import { validate } from "../../../middleware/validate";
import { requireAuthMiddleware } from "../../../middleware/require-auth";
import * as inviteRepo from "../../workspaces/repositories/invite.repository";
import * as memberRepo from "../../workspaces/repositories/member.repository";
import { inviteTokenParamSchema } from "../../workspaces/validators/workspace.schema";

export const inviteRouter = Router();

inviteRouter.post(
  "/:token/accept",
  requireAuthMiddleware,
  validate(inviteTokenParamSchema, "params"),
  async (req, res, next) => {
    try {
      const token = req.params.token as string;
      const invite = await inviteRepo.findInviteByToken(token);
      if (!invite) {
        throw new NotFoundError("Invite not found");
      }
      if (invite.status !== "pending") {
        throw new ConflictError("Invite is no longer valid");
      }
      if (invite.expiresAt < new Date()) {
        throw new ConflictError("Invite has expired");
      }
      if (invite.email.toLowerCase() !== req.user!.email.toLowerCase()) {
        throw new ForbiddenError(
          "This invite was sent to a different email address",
        );
      }

      const existing = await memberRepo.findMembership(
        invite.workspaceId,
        req.user!.id,
      );
      if (existing) {
        throw new ConflictError("You are already a member of this workspace");
      }

      if (invite.role === "owner") {
        throw new ValidationError("Cannot accept invite as owner role");
      }

      await memberRepo.addMember({
        workspaceId: invite.workspaceId,
        userId: req.user!.id,
        role: invite.role,
      });
      await inviteRepo.markInviteAccepted(invite.id, invite.workspaceId);

      sendSuccess(res, {
        workspaceId: invite.workspaceId,
        role: invite.role,
        accepted: true,
      });
    } catch (error) {
      next(error);
    }
  },
);
