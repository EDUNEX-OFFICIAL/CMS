import { describe, expect, it } from "vitest";
import { ValidationError } from "./errors";
import {
  assertUniqueFieldIds,
  parseContentTypeSchema,
  validateEntryData,
} from "./cms-schema";

describe("cms-schema", () => {
  const schema = parseContentTypeSchema({
    fields: [
      { id: "title", name: "Title", type: "text", required: true },
      { id: "body", name: "Body", type: "richText", required: false },
    ],
  });

  it("accepts valid entry data", () => {
    const result = validateEntryData(schema, {
      title: "Hello",
      body: { type: "doc", content: [] },
    });
    expect(result.valid).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = validateEntryData(schema, { body: { type: "doc" } });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.title).toBeDefined();
    }
  });

  it("rejects duplicate field ids", () => {
    expect(() =>
      parseContentTypeSchema({
        fields: [
          { id: "title", name: "Title", type: "text", required: true },
          { id: "Title", name: "Title 2", type: "text", required: false },
        ],
      }),
    ).toThrow(ValidationError);
  });

  it("rejects empty fields array", () => {
    expect(() => parseContentTypeSchema({ fields: [] })).toThrow();
  });

  it("assertUniqueFieldIds catches duplicates", () => {
    expect(() =>
      assertUniqueFieldIds([
        { id: "a", name: "A", type: "text", required: false },
        { id: "a", name: "B", type: "text", required: false },
      ]),
    ).toThrow(ValidationError);
  });
});
