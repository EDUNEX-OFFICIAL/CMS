import {
  parseContentTypeSchema,
  validateEntryData,
  ValidationError,
} from "@repo/shared";
import type { ContentTypeSchemaDefinition } from "@repo/shared";

export function parseAndValidateEntryData(
  schemaInput: unknown,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const schema: ContentTypeSchemaDefinition = parseContentTypeSchema(schemaInput);
  const result = validateEntryData(schema, data);
  if (!result.valid) {
    throw new ValidationError("Entry data validation failed", result.errors);
  }
  return data;
}
