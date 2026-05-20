import { z } from "zod";
import { ValidationError } from "./errors";

export const CmsFieldType = {
  TEXT: "text",
  TEXTAREA: "textarea",
  RICH_TEXT: "richText",
  NUMBER: "number",
  BOOLEAN: "boolean",
  DATE: "date",
  SLUG: "slug",
} as const;

export type CmsFieldType = (typeof CmsFieldType)[keyof typeof CmsFieldType];

const fieldTypeSchema = z.enum([
  CmsFieldType.TEXT,
  CmsFieldType.TEXTAREA,
  CmsFieldType.RICH_TEXT,
  CmsFieldType.NUMBER,
  CmsFieldType.BOOLEAN,
  CmsFieldType.DATE,
  CmsFieldType.SLUG,
]);

export const cmsFieldSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/i, "Field id must be alphanumeric"),
  name: z.string().min(1),
  type: fieldTypeSchema,
  required: z.boolean().optional().default(false),
});

export const contentTypeSchemaDefinition = z.object({
  fields: z.array(cmsFieldSchema).min(1),
});

export type CmsFieldDefinition = z.infer<typeof cmsFieldSchema>;
export type ContentTypeSchemaDefinition = z.infer<
  typeof contentTypeSchemaDefinition
>;

export function assertUniqueFieldIds(
  fields: ContentTypeSchemaDefinition["fields"],
): void {
  const seen = new Set<string>();
  for (const field of fields) {
    const key = field.id.toLowerCase();
    if (seen.has(key)) {
      throw new ValidationError(`Duplicate field id: ${field.id}`);
    }
    seen.add(key);
  }
}

export function parseContentTypeSchema(
  input: unknown,
): ContentTypeSchemaDefinition {
  const parsed = contentTypeSchemaDefinition.parse(input);
  assertUniqueFieldIds(parsed.fields);
  return parsed;
}

function validateFieldValue(
  field: CmsFieldDefinition,
  value: unknown,
): string | null {
  if (value === undefined || value === null || value === "") {
    if (field.required) {
      return `${field.name} is required`;
    }
    return null;
  }

  switch (field.type) {
    case CmsFieldType.TEXT:
    case CmsFieldType.TEXTAREA:
    case CmsFieldType.SLUG:
      if (typeof value !== "string") {
        return `${field.name} must be a string`;
      }
      return null;
    case CmsFieldType.NUMBER:
      if (typeof value !== "number" || Number.isNaN(value)) {
        return `${field.name} must be a number`;
      }
      return null;
    case CmsFieldType.BOOLEAN:
      if (typeof value !== "boolean") {
        return `${field.name} must be a boolean`;
      }
      return null;
    case CmsFieldType.DATE:
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        return `${field.name} must be a valid date string`;
      }
      return null;
    case CmsFieldType.RICH_TEXT:
      if (typeof value !== "object" || value === null) {
        return `${field.name} must be rich text JSON`;
      }
      return null;
    default:
      return `${field.name} has unsupported type`;
  }
}

export function validateEntryData(
  schema: ContentTypeSchemaDefinition,
  data: Record<string, unknown>,
): { valid: true } | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of schema.fields) {
    const message = validateFieldValue(field, data[field.id]);
    if (message) {
      errors[field.id] = message;
    }
  }

  const allowedIds = new Set(schema.fields.map((f) => f.id));
  for (const key of Object.keys(data)) {
    if (!allowedIds.has(key)) {
      errors[key] = `Unknown field: ${key}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
