import { describe, expect, it } from "vitest";
import { hasPermission, Permission, WorkspaceRole } from "./rbac";

describe("hasPermission", () => {
  it("grants owner full workspace permissions", () => {
    expect(hasPermission(WorkspaceRole.OWNER, Permission.WORKSPACE_DELETE)).toBe(
      true,
    );
    expect(
      hasPermission(WorkspaceRole.OWNER, Permission.WORKSPACE_MEMBERS_INVITE),
    ).toBe(true);
  });

  it("grants admin invite but not delete workspace", () => {
    expect(
      hasPermission(WorkspaceRole.ADMIN, Permission.WORKSPACE_MEMBERS_INVITE),
    ).toBe(true);
    expect(hasPermission(WorkspaceRole.ADMIN, Permission.WORKSPACE_DELETE)).toBe(
      false,
    );
  });

  it("denies viewer invite permission", () => {
    expect(
      hasPermission(WorkspaceRole.VIEWER, Permission.WORKSPACE_MEMBERS_INVITE),
    ).toBe(false);
    expect(hasPermission(WorkspaceRole.VIEWER, Permission.WORKSPACE_VIEW)).toBe(
      true,
    );
  });

  it("grants editor publish but denies viewer publish", () => {
    expect(
      hasPermission(WorkspaceRole.EDITOR, Permission.CMS_ENTRIES_PUBLISH),
    ).toBe(true);
    expect(
      hasPermission(WorkspaceRole.VIEWER, Permission.CMS_ENTRIES_PUBLISH),
    ).toBe(false);
  });

  it("denies editor content type create", () => {
    expect(
      hasPermission(WorkspaceRole.EDITOR, Permission.CMS_CONTENT_TYPES_CREATE),
    ).toBe(false);
    expect(
      hasPermission(WorkspaceRole.ADMIN, Permission.CMS_CONTENT_TYPES_CREATE),
    ).toBe(true);
  });

  it("grants editor media upload but denies viewer upload", () => {
    expect(
      hasPermission(WorkspaceRole.EDITOR, Permission.MEDIA_ASSETS_UPLOAD),
    ).toBe(true);
    expect(
      hasPermission(WorkspaceRole.VIEWER, Permission.MEDIA_ASSETS_UPLOAD),
    ).toBe(false);
    expect(
      hasPermission(WorkspaceRole.VIEWER, Permission.MEDIA_ASSETS_VIEW),
    ).toBe(true);
  });
});
