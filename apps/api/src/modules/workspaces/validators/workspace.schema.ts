import { z } from "zod";
import { WorkspaceRole } from "@repo/shared";

const roleSchema = z.enum([
  WorkspaceRole.OWNER,
  WorkspaceRole.ADMIN,
  WorkspaceRole.EDITOR,
  WorkspaceRole.VIEWER,
]);

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum([WorkspaceRole.ADMIN, WorkspaceRole.EDITOR, WorkspaceRole.VIEWER]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([
    WorkspaceRole.ADMIN,
    WorkspaceRole.EDITOR,
    WorkspaceRole.VIEWER,
  ]),
});

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const memberIdParamSchema = z.object({
  workspaceId: z.string().uuid(),
  memberId: z.string().uuid(),
});

export const inviteTokenParamSchema = z.object({
  token: z.string().min(1),
});

export { roleSchema };
