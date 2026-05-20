export const WorkspaceRole = {
  OWNER: "owner",
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type WorkspaceRole =
  (typeof WorkspaceRole)[keyof typeof WorkspaceRole];

export const Permission = {
  WORKSPACE_VIEW: "workspace.view",
  WORKSPACE_UPDATE: "workspace.update",
  WORKSPACE_DELETE: "workspace.delete",
  WORKSPACE_MEMBERS_INVITE: "workspace.members.invite",
  WORKSPACE_MEMBERS_REMOVE: "workspace.members.remove",
  WORKSPACE_MEMBERS_ASSIGN_ROLE: "workspace.members.assign_role",
  WORKSPACE_TRANSFER_OWNERSHIP: "workspace.transfer_ownership",
  CMS_CONTENT_TYPES_VIEW: "cms.content_types.view",
  CMS_CONTENT_TYPES_CREATE: "cms.content_types.create",
  CMS_CONTENT_TYPES_UPDATE: "cms.content_types.update",
  CMS_CONTENT_TYPES_DELETE: "cms.content_types.delete",
  CMS_ENTRIES_VIEW: "cms.entries.view",
  CMS_ENTRIES_CREATE: "cms.entries.create",
  CMS_ENTRIES_EDIT: "cms.entries.edit",
  CMS_ENTRIES_DELETE: "cms.entries.delete",
  CMS_ENTRIES_PUBLISH: "cms.entries.publish",
  MEDIA_ASSETS_VIEW: "media.assets.view",
  MEDIA_ASSETS_UPLOAD: "media.assets.upload",
  MEDIA_ASSETS_DELETE: "media.assets.delete",
  MEDIA_FOLDERS_ORGANIZE: "media.folders.organize",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly Permission[]> = {
  owner: [
    Permission.WORKSPACE_VIEW,
    Permission.WORKSPACE_UPDATE,
    Permission.WORKSPACE_DELETE,
    Permission.WORKSPACE_MEMBERS_INVITE,
    Permission.WORKSPACE_MEMBERS_REMOVE,
    Permission.WORKSPACE_MEMBERS_ASSIGN_ROLE,
    Permission.WORKSPACE_TRANSFER_OWNERSHIP,
    Permission.CMS_CONTENT_TYPES_VIEW,
    Permission.CMS_CONTENT_TYPES_CREATE,
    Permission.CMS_CONTENT_TYPES_UPDATE,
    Permission.CMS_CONTENT_TYPES_DELETE,
    Permission.CMS_ENTRIES_VIEW,
    Permission.CMS_ENTRIES_CREATE,
    Permission.CMS_ENTRIES_EDIT,
    Permission.CMS_ENTRIES_DELETE,
    Permission.CMS_ENTRIES_PUBLISH,
    Permission.MEDIA_ASSETS_VIEW,
    Permission.MEDIA_ASSETS_UPLOAD,
    Permission.MEDIA_ASSETS_DELETE,
    Permission.MEDIA_FOLDERS_ORGANIZE,
  ],
  admin: [
    Permission.WORKSPACE_VIEW,
    Permission.WORKSPACE_UPDATE,
    Permission.WORKSPACE_MEMBERS_INVITE,
    Permission.WORKSPACE_MEMBERS_REMOVE,
    Permission.WORKSPACE_MEMBERS_ASSIGN_ROLE,
    Permission.CMS_CONTENT_TYPES_VIEW,
    Permission.CMS_CONTENT_TYPES_CREATE,
    Permission.CMS_CONTENT_TYPES_UPDATE,
    Permission.CMS_CONTENT_TYPES_DELETE,
    Permission.CMS_ENTRIES_VIEW,
    Permission.CMS_ENTRIES_CREATE,
    Permission.CMS_ENTRIES_EDIT,
    Permission.CMS_ENTRIES_DELETE,
    Permission.CMS_ENTRIES_PUBLISH,
    Permission.MEDIA_ASSETS_VIEW,
    Permission.MEDIA_ASSETS_UPLOAD,
    Permission.MEDIA_ASSETS_DELETE,
    Permission.MEDIA_FOLDERS_ORGANIZE,
  ],
  editor: [
    Permission.WORKSPACE_VIEW,
    Permission.CMS_CONTENT_TYPES_VIEW,
    Permission.CMS_ENTRIES_VIEW,
    Permission.CMS_ENTRIES_CREATE,
    Permission.CMS_ENTRIES_EDIT,
    Permission.CMS_ENTRIES_DELETE,
    Permission.CMS_ENTRIES_PUBLISH,
    Permission.MEDIA_ASSETS_VIEW,
    Permission.MEDIA_ASSETS_UPLOAD,
    Permission.MEDIA_ASSETS_DELETE,
    Permission.MEDIA_FOLDERS_ORGANIZE,
  ],
  viewer: [
    Permission.WORKSPACE_VIEW,
    Permission.CMS_CONTENT_TYPES_VIEW,
    Permission.CMS_ENTRIES_VIEW,
    Permission.MEDIA_ASSETS_VIEW,
  ],
};

export function hasPermission(
  role: WorkspaceRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isWorkspaceRole(value: string): value is WorkspaceRole {
  return Object.values(WorkspaceRole).includes(value as WorkspaceRole);
}
