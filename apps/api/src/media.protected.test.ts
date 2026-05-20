import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app";

describe("Media routes", () => {
  it("returns 401 for assets without session", async () => {
    const app = createApp();
    const response = await request(app).get("/api/v1/assets");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns 401 for upload-requests without session", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/api/v1/assets/upload-requests")
      .send({
        filename: "test.png",
        mimeType: "image/png",
        sizeBytes: 1024,
      });
    expect(response.status).toBe(401);
  });
});
