import { describe, expect, it } from "vitest";
import { DEFAULT_CONTENT_TYPE_TEMPLATES } from "./default-content-types";
import { parseContentTypeSchema } from "./cms-schema";

describe("DEFAULT_CONTENT_TYPE_TEMPLATES", () => {
  it("includes blog and page with valid schemas", () => {
    expect(DEFAULT_CONTENT_TYPE_TEMPLATES.map((t) => t.slug)).toEqual([
      "blog",
      "page",
    ]);
    for (const template of DEFAULT_CONTENT_TYPE_TEMPLATES) {
      expect(() => parseContentTypeSchema(template.schema)).not.toThrow();
    }
  });
});
