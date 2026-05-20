# Phase 4b — Media (future)

Phase 4 **MVP** is complete in the codebase: presigned uploads, asset records, media library UI, folders. This document tracks work **intentionally deferred** to a later slice.

## Deferred features

### Image processing pipeline

- BullMQ job `asset.process` enqueued on `POST /api/v1/assets/:id/complete`
- Use `sharp` to generate variants (e.g. `thumb`, `medium`, WebP)
- Store variant keys in `assets.metadata.variants`
- Optional: serve variants via CDN path rules

### CMS integration

- New field type `media` or `image` in [`packages/shared/src/cms-schema.ts`](../../packages/shared/src/cms-schema.ts)
- Entry `data` stores `assetId`; editor opens media picker from [`/media`](../../apps/web/src/app/(dashboard)/media/page.tsx)
- Validation: asset must belong to same workspace and be `ready`

### Public delivery

- Storefront reads published content and resolves asset URLs (Phase 6+ builder/storefront)
- Production CDN / signed GET URLs instead of dev public bucket policy

## Prerequisites before starting 4b

1. Phase 4 MVP verified locally — see [MEDIA_LOCAL_SETUP.md](./MEDIA_LOCAL_SETUP.md)
2. MinIO CORS and `S3_PUBLIC_URL` working; browser upload succeeds
3. `pnpm db:migrate` applied (`0004_media` — `assets`, `media_folders`)
4. API health reports `phase: "4"`

## Suggested order when implementing

1. Queue worker handler + variant generation
2. Extend `AssetDto` / list API to expose variant URLs
3. Media picker component in entry form
4. `media` field type + validation
5. Storefront asset URL helper

## Out of scope for 4b unless explicitly scoped

- Virus scanning, full-text asset search, video transcoding
- Phase 5 dashboard shell (React Query, Radix sidebar) — separate phase per [IMPLEMENTATION_PLAN.md](../product/IMPLEMENTATION_PLAN.md)
