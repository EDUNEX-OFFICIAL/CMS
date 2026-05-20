import { DEFAULT_CONTENT_TYPE_TEMPLATES } from "@repo/shared";
import * as contentTypeRepo from "../repositories/content-type.repository";

export async function ensureDefaultContentTypes(
  workspaceId: string,
): Promise<{ created: number }> {
  let created = 0;
  for (const template of DEFAULT_CONTENT_TYPE_TEMPLATES) {
    const existing = await contentTypeRepo.findContentTypeBySlug(
      workspaceId,
      template.slug,
    );
    if (existing) {
      continue;
    }
    await contentTypeRepo.createContentType(workspaceId, {
      name: template.name,
      slug: template.slug,
      description: template.description,
      schema: template.schema,
    });
    created += 1;
  }
  return { created };
}
