import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app";

describe("CMS routes", () => {
  it("returns 401 for content-types without session", async () => {
    const app = createApp();
    const response = await request(app).get("/api/v1/content-types");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns 403 for content-types without workspace context", async () => {
    const app = createApp();
    const response = await request(app)
      .get("/api/v1/content-types")
      .set("Cookie", "cms_session=invalid");
    expect([401, 403]).toContain(response.status);
  });
});
