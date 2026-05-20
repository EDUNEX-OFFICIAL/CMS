import type { ContentTypeSchemaDefinition } from "./cms-schema";

export type DefaultContentTypeTemplate = {
  name: string;
  slug: string;
  description: string;
  schema: ContentTypeSchemaDefinition;
};

export const DEFAULT_CONTENT_TYPE_TEMPLATES: readonly DefaultContentTypeTemplate[] =
  [
    {
      name: "Blog Post",
      slug: "blog",
      description: "Articles and blog posts",
      schema: {
        fields: [
          { id: "title", name: "Title", type: "text", required: true },
          { id: "body", name: "Body", type: "richText", required: false },
        ],
      },
    },
    {
      name: "Page",
      slug: "page",
      description: "Static pages",
      schema: {
        fields: [
          { id: "title", name: "Title", type: "text", required: true },
          { id: "slug", name: "URL slug", type: "slug", required: false },
          { id: "body", name: "Body", type: "richText", required: false },
        ],
      },
    },
  ] as const;
