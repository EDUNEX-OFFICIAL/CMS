import type { Permission, WorkspaceRole } from "@repo/shared";
import type { AuthUserDto, SessionPayload } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: AuthUserDto;
      session?: SessionPayload;
      workspace?: {
        id: string;
        name: string;
        slug: string;
        role: WorkspaceRole;
        memberId: string;
      };
      requiredPermission?: Permission;
    }
  }
}

export {};
