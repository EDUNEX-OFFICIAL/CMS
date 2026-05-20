import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app";

vi.mock("./lib/firebase.js", () => ({
  verifyFirebaseIdToken: vi.fn().mockResolvedValue({
    firebaseUid: "test-uid",
    email: "test@example.com",
    displayName: "Test",
    avatarUrl: null,
  }),
}));

describe("protected routes", () => {
  it("returns 401 for workspaces without session", async () => {
    const app = createApp();
    const response = await request(app).get("/api/v1/workspaces");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
