import { Router } from "express";
import { ForbiddenError, UnauthorizedError } from "@repo/shared";
import type { AuthMeDto } from "@repo/types";
import { verifyFirebaseIdToken } from "../../../lib/firebase";
import {
  createSession,
  destroySession,
  reissueSessionToken,
  sessionCookieOptions,
  updateSessionWorkspace,
} from "../../../lib/session";
import { sendSuccess } from "../../../lib/response";
import { validate } from "../../../middleware/validate";
import { requireAuthMiddleware } from "../../../middleware/require-auth";
import { authRateLimiter } from "../../../middleware/security";
import { getEnv } from "../../../config/env";
import {
  findMembership,
} from "../../workspaces/repositories/member.repository";
import { listWorkspacesForUser } from "../../workspaces/repositories/member.repository";
import {
  toAuthUserDto,
  upsertUserFromFirebase,
} from "../repositories/user.repository";
import {
  activeWorkspaceSchema,
  createSessionSchema,
} from "../validators/auth.schema";

export const authRouter = Router();

authRouter.use(authRateLimiter);

authRouter.post(
  "/session",
  validate(createSessionSchema),
  async (req, res, next) => {
    try {
      const firebaseUser = await verifyFirebaseIdToken(req.body.idToken);
      const user = await upsertUserFromFirebase(firebaseUser);
      const workspaces = await listWorkspacesForUser(user.id);
      const activeWorkspaceId = workspaces[0]?.id;

      const { token } = await createSession(user.id, activeWorkspaceId);
      const env = getEnv();
      res.cookie(env.SESSION_COOKIE_NAME, token, sessionCookieOptions());
      sendSuccess(res, { user: toAuthUserDto(user) }, 201);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post("/logout", requireAuthMiddleware, async (req, res, next) => {
  try {
    if (req.session) {
      await destroySession(req.session.sessionId);
    }
    const env = getEnv();
    res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
    sendSuccess(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuthMiddleware, async (req, res, next) => {
  try {
    const workspaces = await listWorkspacesForUser(req.user!.id);
    let activeWorkspace = null;

    if (req.session?.activeWorkspaceId) {
      const match = workspaces.find(
        (w) => w.id === req.session!.activeWorkspaceId,
      );
      if (match) {
        activeWorkspace = {
          id: match.id,
          name: match.name,
          slug: match.slug,
          role: match.role,
        };
      }
    }

    const data: AuthMeDto = {
      user: req.user!,
      activeWorkspace,
    };
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

authRouter.patch(
  "/active-workspace",
  requireAuthMiddleware,
  validate(activeWorkspaceSchema),
  async (req, res, next) => {
    try {
      const workspaceId = req.body.workspaceId as string | null;
      if (workspaceId) {
        const membership = await findMembership(workspaceId, req.user!.id);
        if (!membership) {
          throw new ForbiddenError("You are not a member of this workspace");
        }
      }

      const updated = await updateSessionWorkspace(
        req.session!.sessionId,
        req.user!.id,
        workspaceId ?? undefined,
      );
      if (!updated) {
        throw new UnauthorizedError("Session expired");
      }

      const token = await reissueSessionToken(updated);
      const env = getEnv();
      res.cookie(env.SESSION_COOKIE_NAME, token, sessionCookieOptions());

      const workspaces = await listWorkspacesForUser(req.user!.id);
      const active = workspaceId
        ? workspaces.find((w) => w.id === workspaceId)
        : null;

      sendSuccess(res, {
        activeWorkspace: active
          ? {
              id: active.id,
              name: active.name,
              slug: active.slug,
              role: active.role,
            }
          : null,
      });
    } catch (error) {
      next(error);
    }
  },
);
