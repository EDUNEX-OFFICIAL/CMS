import { describe, expect, it } from "vitest";
import { ValidationError } from "./errors";
import {
  isAllowedMimeType,
  sanitizeStorageFilename,
  validateUploadRequest,
} from "./media-validation";

describe("media-validation", () => {
  it("allows image and pdf mime types", () => {
    expect(isAllowedMimeType("image/png")).toBe(true);
    expect(isAllowedMimeType("application/pdf")).toBe(true);
    expect(isAllowedMimeType("text/plain")).toBe(false);
  });

  it("rejects oversized uploads", () => {
    expect(() =>
      validateUploadRequest({
        filename: "big.png",
        mimeType: "image/png",
        sizeBytes: 11 * 1024 * 1024,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects path-like filenames", () => {
    expect(() =>
      validateUploadRequest({
        filename: "../secret.png",
        mimeType: "image/png",
        sizeBytes: 1000,
      }),
    ).toThrow(ValidationError);
  });

  it("sanitizes storage filenames", () => {
    expect(sanitizeStorageFilename("My Photo (1).png")).toBe("My_Photo__1_.png");
  });
});
