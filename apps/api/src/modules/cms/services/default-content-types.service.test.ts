import { describe, expect, it, vi, beforeEach } from "vitest";
import * as contentTypeRepo from "../repositories/content-type.repository";
import { ensureDefaultContentTypes } from "./default-content-types.service";

vi.mock("../repositories/content-type.repository");

describe("ensureDefaultContentTypes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("creates blog and page when missing", async () => {
    vi.mocked(contentTypeRepo.findContentTypeBySlug).mockResolvedValue(null);
    vi.mocked(contentTypeRepo.createContentType).mockResolvedValue({} as never);

    const result = await ensureDefaultContentTypes("ws-1");

    expect(result.created).toBe(2);
    expect(contentTypeRepo.createContentType).toHaveBeenCalledTimes(2);
  });

  it("is idempotent when slugs already exist", async () => {
    vi.mocked(contentTypeRepo.findContentTypeBySlug).mockResolvedValue({
      id: "existing",
    } as never);

    const result = await ensureDefaultContentTypes("ws-1");

    expect(result.created).toBe(0);
    expect(contentTypeRepo.createContentType).not.toHaveBeenCalled();
  });
});
