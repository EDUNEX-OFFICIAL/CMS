export type WorkspaceId = string;
export type UserId = string;

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export type EntryStatus = "draft" | "published" | "archived";

export type CmsFieldType =
  | "text"
  | "textarea"
  | "richText"
  | "number"
  | "boolean"
  | "date"
  | "slug";

export type CmsFieldDto = {
  id: string;
  name: string;
  type: CmsFieldType;
  required?: boolean;
};

export type ContentTypeSchemaDto = {
  fields: CmsFieldDto[];
};

export type ContentTypeDto = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  schema: ContentTypeSchemaDto;
  createdAt: string;
  updatedAt: string;
};

export type EntryDto = {
  id: string;
  workspaceId: string;
  contentTypeId: string;
  slug: string;
  status: EntryStatus;
  data: Record<string, unknown>;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EntryListDto = EntryDto & {
  contentType?: Pick<ContentTypeDto, "id" | "name" | "slug">;
};

export type PaginationDto = {
  nextCursor: string | null;
  hasMore: boolean;
};

export type PaginatedEntriesDto = {
  items: EntryListDto[];
  pagination: PaginationDto;
};

export type AssetStatus = "pending" | "ready" | "failed";

export type AssetDto = {
  id: string;
  workspaceId: string;
  folderId: string | null;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number | null;
  status: AssetStatus;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
  url: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaFolderDto = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type PresignedUploadDto = {
  assetId: string;
  uploadUrl: string;
  storageKey: string;
  expiresAt: string;
};

export type PaginatedAssetsDto = {
  items: AssetDto[];
  pagination: PaginationDto;
};

export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export type SessionPayload = {
  userId: UserId;
  sessionId: string;
  activeWorkspaceId?: WorkspaceId;
};

export type AuthUserDto = {
  id: UserId;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type WorkspaceSummaryDto = {
  id: WorkspaceId;
  name: string;
  slug: string;
  role: WorkspaceRole;
};

export type AuthMeDto = {
  user: AuthUserDto;
  activeWorkspace: WorkspaceSummaryDto | null;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
  validationErrors?: unknown;
  correlationId?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorBody;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type HealthStatus = {
  status: "ok" | "degraded" | "error";
  phase: string;
  version: string;
};

export type ReadinessCheck = {
  name: string;
  status: "ok" | "error";
  message?: string;
};

export type ReadinessStatus = {
  status: "ok" | "degraded" | "error";
  checks: ReadinessCheck[];
};

/** @deprecated Use HealthStatus */
export type ApiHealth = {
  status: "ok";
  phase: string;
};
