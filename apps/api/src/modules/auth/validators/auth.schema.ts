import { z } from "zod";

export const createSessionSchema = z.object({
  idToken: z.string().min(1),
});

export const activeWorkspaceSchema = z.object({
  workspaceId: z.string().uuid().nullable(),
});
