import type {
  ApiResponse,
  AssetDto,
  AuthMeDto,
  ContentTypeDto,
  ContentTypeSchemaDto,
  EntryDto,
  MediaFolderDto,
  PaginatedAssetsDto,
  PaginatedEntriesDto,
  PresignedUploadDto,
  WorkspaceSummaryDto,
} from "@repo/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function workspaceHeaders(workspaceId?: string): HeadersInit {
  return workspaceId ? { "X-Workspace-Id": workspaceId } : {};
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { workspaceId?: string } = {},
): Promise<ApiResponse<T>> {
  const { workspaceId, ...fetchOptions } = options;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...workspaceHeaders(workspaceId),
        ...(fetchOptions.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. Is pnpm dev running and the API listening on port 4000?`,
    );
  }

  return response.json() as Promise<ApiResponse<T>>;
}

export async function createSession(idToken: string) {
  return apiFetch<{ user: AuthMeDto["user"] }>("/api/v1/auth/session", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function logout() {
  return apiFetch<{ loggedOut: boolean }>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function getMe() {
  return apiFetch<AuthMeDto>("/api/v1/auth/me");
}

export async function setActiveWorkspace(workspaceId: string | null) {
  return apiFetch<{ activeWorkspace: WorkspaceSummaryDto | null }>(
    "/api/v1/auth/active-workspace",
    {
      method: "PATCH",
      body: JSON.stringify({ workspaceId }),
    },
  );
}

export async function listWorkspaces() {
  return apiFetch<WorkspaceSummaryDto[]>("/api/v1/workspaces");
}

export async function createWorkspace(name: string) {
  return apiFetch<WorkspaceSummaryDto>("/api/v1/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateWorkspace(
  workspaceId: string,
  body: { name?: string; slug?: string },
) {
  return apiFetch<{ id: string; name: string; slug: string }>(
    `/api/v1/workspaces/${workspaceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteWorkspace(workspaceId: string) {
  return apiFetch<{ deleted: boolean }>(
    `/api/v1/workspaces/${workspaceId}`,
    { method: "DELETE" },
  );
}

export async function bootstrapDefaultContentTypes(workspaceId: string) {
  return apiFetch<{
    created: number;
    contentTypes: ContentTypeDto[];
  }>("/api/v1/content-types/bootstrap-defaults", {
    method: "POST",
    workspaceId,
  });
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: "admin" | "editor" | "viewer",
) {
  return apiFetch<{
    inviteUrl: string;
    email: string;
    role: string;
  }>(`/api/v1/workspaces/${workspaceId}/invites`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export async function acceptInvite(token: string) {
  return apiFetch<{ workspaceId: string; accepted: boolean }>(
    `/api/v1/invites/${token}/accept`,
    { method: "POST" },
  );
}

export async function listContentTypes(workspaceId: string) {
  return apiFetch<ContentTypeDto[]>("/api/v1/content-types", { workspaceId });
}

export async function createContentType(
  workspaceId: string,
  body: {
    name: string;
    slug?: string;
    description?: string;
    schema: ContentTypeSchemaDto;
  },
) {
  return apiFetch<ContentTypeDto>("/api/v1/content-types", {
    method: "POST",
    workspaceId,
    body: JSON.stringify(body),
  });
}

export async function listEntries(
  workspaceId: string,
  query?: {
    status?: string;
    contentTypeId?: string;
    cursor?: string;
  },
) {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.contentTypeId) params.set("contentTypeId", query.contentTypeId);
  if (query?.cursor) params.set("cursor", query.cursor);
  const qs = params.toString();
  return apiFetch<PaginatedEntriesDto>(
    `/api/v1/entries${qs ? `?${qs}` : ""}`,
    { workspaceId },
  );
}

export async function getEntry(workspaceId: string, entryId: string) {
  return apiFetch<EntryDto>(`/api/v1/entries/${entryId}`, { workspaceId });
}

export async function createEntry(
  workspaceId: string,
  body: {
    contentTypeId: string;
    slug?: string;
    status?: string;
    data: Record<string, unknown>;
  },
) {
  return apiFetch<EntryDto>("/api/v1/entries", {
    method: "POST",
    workspaceId,
    body: JSON.stringify(body),
  });
}

export async function updateEntry(
  workspaceId: string,
  entryId: string,
  body: {
    slug?: string;
    status?: string;
    data?: Record<string, unknown>;
  },
) {
  return apiFetch<EntryDto>(`/api/v1/entries/${entryId}`, {
    method: "PATCH",
    workspaceId,
    body: JSON.stringify(body),
  });
}

export async function publishEntry(workspaceId: string, entryId: string) {
  return apiFetch<EntryDto>(`/api/v1/entries/${entryId}/publish`, {
    method: "POST",
    workspaceId,
  });
}

export async function createAssetUploadRequest(
  workspaceId: string,
  body: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    folderId?: string | null;
  },
) {
  return apiFetch<PresignedUploadDto>("/api/v1/assets/upload-requests", {
    method: "POST",
    workspaceId,
    body: JSON.stringify(body),
  });
}

export async function completeAssetUpload(workspaceId: string, assetId: string) {
  return apiFetch<AssetDto>(`/api/v1/assets/${assetId}/complete`, {
    method: "POST",
    workspaceId,
  });
}

export async function listAssets(
  workspaceId: string,
  query?: {
    folderId?: string;
    mimeType?: string;
    q?: string;
    cursor?: string;
  },
) {
  const params = new URLSearchParams();
  if (query?.folderId) params.set("folderId", query.folderId);
  if (query?.mimeType) params.set("mimeType", query.mimeType);
  if (query?.q) params.set("q", query.q);
  if (query?.cursor) params.set("cursor", query.cursor);
  const qs = params.toString();
  return apiFetch<PaginatedAssetsDto>(
    `/api/v1/assets${qs ? `?${qs}` : ""}`,
    { workspaceId },
  );
}

export async function deleteAsset(workspaceId: string, assetId: string) {
  return apiFetch<{ deleted: boolean }>(`/api/v1/assets/${assetId}`, {
    method: "DELETE",
    workspaceId,
  });
}

export async function listMediaFolders(workspaceId: string) {
  return apiFetch<MediaFolderDto[]>("/api/v1/media-folders", { workspaceId });
}

export async function createMediaFolder(
  workspaceId: string,
  body: { name: string; slug?: string; parentId?: string | null },
) {
  return apiFetch<MediaFolderDto>("/api/v1/media-folders", {
    method: "POST",
    workspaceId,
    body: JSON.stringify(body),
  });
}
