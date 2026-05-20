# Media — local development setup

One-time setup so the **Media** tab can upload files from the browser to MinIO.

## Prerequisites

- Docker services running: `docker compose -f docker/docker-compose.yml up -d`
- Repo root `.env.local` includes:

```env
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=cms-dev
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_PUBLIC_URL=http://localhost:9000/cms-dev
```

Restart `pnpm dev` after changing env.

## 1. Database

```powershell
pnpm db:migrate
```

Ensures `assets` and `media_folders` tables exist (`0004_media`).

## 2. MinIO bucket and public read (thumbnails)

```powershell
docker exec cms-minio mc alias set local http://localhost:9000 minio minio123
docker exec cms-minio mc mb local/cms-dev --ignore-existing
docker cp docker/minio-cors.json cms-minio:/tmp/cors.json
docker exec cms-minio mc cors set local/cms-dev /tmp/cors.json
```

If `mc cors set` fails with `decoding xml: EOF`, set CORS in MinIO Console (http://localhost:9001) → Buckets → `cms-dev` → CORS, or add to `docker-compose.yml`:

```yaml
environment:
  MINIO_API_CORS_ALLOW_ORIGIN: "http://localhost:3000"
```

Then restart the MinIO container and retry upload.

```powershell
docker exec cms-minio mc anonymous set download local/cms-dev
```

`S3_PUBLIC_URL` must match `http://localhost:9000/cms-dev` so the UI can show image thumbnails.

API startup also attempts to create the bucket via `ensureS3Bucket()` in [`apps/api/src/lib/s3.ts`](../../apps/api/src/lib/s3.ts).

## 3. CORS (browser PUT uploads)

If upload fails with a network/CORS error from `localhost:3000`:

1. Confirm [`docker/minio-cors.json`](../../docker/minio-cors.json) uses `AllowedOrigin` (MinIO `mc` format).
2. Re-run `mc cors set` above.
3. Alternatively set CORS in MinIO Console: http://localhost:9001 → Bucket `cms-dev` → CORS.

## 4. Verify

1. `pnpm dev` — API on :4000, web on :3000
2. Login → select active workspace → **Media**
3. Upload a PNG → appears in grid with thumbnail
4. `GET http://localhost:4000/api/v1/health` → `phase: "4"`

## Troubleshooting

| Symptom | Likely cause | Fix |
|--------|----------------|-----|
| Upload to storage failed (4xx/5xx) | MinIO down or wrong `S3_*` | Start Docker; check `.env.local` |
| CORS error in browser console | CORS not applied on bucket | Run `mc cors set` or use console |
| Thumbnail broken, upload OK | Missing public read or wrong `S3_PUBLIC_URL` | `mc anonymous set download`; set `S3_PUBLIC_URL` |
| 403 on upload-requests | Viewer role | Use owner/admin/editor |
| Object not found on complete | PUT never reached MinIO | Retry upload; check CORS |

## Future work

Image variants and CMS `media` field type are documented in [PHASE_4B_MEDIA_FUTURE.md](./PHASE_4B_MEDIA_FUTURE.md).
