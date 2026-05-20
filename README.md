# CMS Platform

Modular monorepo for the CMS platform.

**What is built today (Phases 0–4):** [docs/product/DEVELOPMENT_STATUS.md](./docs/product/DEVELOPMENT_STATUS.md)  
**What we plan to build:** [docs/product/ROADMAP.md](./docs/product/ROADMAP.md)  
**Using the dashboard:** [docs/engineering/WEB_DASHBOARD_GUIDE.md](./docs/engineering/WEB_DASHBOARD_GUIDE.md)  
**All docs:** [docs/README.md](./docs/README.md)

## Prerequisites

- Node.js v20+
- pnpm v9+
- Docker Desktop (for local PostgreSQL, Redis, MinIO)

## Quick start

```powershell
# Install dependencies
pnpm install

# Start local infrastructure (PostgreSQL, Redis, MinIO)
docker compose -f docker/docker-compose.yml up -d

# Copy environment template (repo root — used by API and web)
copy .env.local.example .env.local

# Apply database migrations and seed demo data
pnpm db:migrate
pnpm db:seed

# Run all apps in development mode
pnpm dev
```

## Development URLs

| Application | URL |
|-------------|-----|
| Web Dashboard | http://localhost:3000/login |
| Dashboard (workspaces) | http://localhost:3000/dashboard |
| Content types | http://localhost:3000/content-types |
| Entries | http://localhost:3000/entries |
| Media library | http://localhost:3000/media |
| Storefront (stub) | http://localhost:3001 |
| API health | http://localhost:4000/api/v1/health |
| MinIO Console | http://localhost:9001 |

> **PostgreSQL:** Docker maps host port **5433** → container 5432 (avoids conflict with local Postgres on Windows). Use `DATABASE_URL=...@localhost:5433/cms_dev` in `.env.local`.

## Monorepo structure

```txt
/apps          web, api, storefront
/packages      ui, db, shared, config, types
/docker        Local infrastructure
/docs          Documentation
/infrastructure Deployment configs (reserved)
/scripts       Automation scripts (reserved)
```

## Common commands

```bash
pnpm dev          # Start all apps
pnpm build        # Build all packages and apps
pnpm lint         # ESLint across workspace
pnpm typecheck    # TypeScript validation
pnpm test         # Run tests
pnpm format       # Prettier format

pnpm --filter web dev           # Web only
pnpm --filter storefront dev    # Storefront only
pnpm --filter api dev           # API only
```

## Firebase setup (Phase 2)

1. Create a Firebase project and enable **Email/Password** and **Google** sign-in.
2. Create a service account and copy credentials into `.env.local` (`FIREBASE_*`).
3. Add a Web app in Firebase console and copy config into `NEXT_PUBLIC_FIREBASE_*` in **repo root** `.env.local` (not `apps/web/`).
4. Restart `pnpm dev` after changing env — Next.js only picks up `NEXT_PUBLIC_*` on startup.
5. **Dev quick login:** set `NEXT_PUBLIC_DEV_QUICK_LOGINS` in `.env.local` (see `.env.local.example`) — adds one-click sign-in buttons on `/login` so you do not re-type credentials after each restart.

## API endpoints

All CMS routes require auth plus active workspace (`X-Workspace-Id` header or session `activeWorkspaceId`).

```txt
# Auth
POST   /api/v1/auth/session
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
PATCH  /api/v1/auth/active-workspace

# Workspaces
GET    /api/v1/workspaces
POST   /api/v1/workspaces
GET    /api/v1/workspaces/:workspaceId
PATCH  /api/v1/workspaces/:workspaceId
DELETE /api/v1/workspaces/:workspaceId
GET    /api/v1/workspaces/:workspaceId/members
POST   /api/v1/workspaces/:workspaceId/invites
POST   /api/v1/invites/:token/accept

# CMS (Phase 3) — workspace context required
GET    /api/v1/content-types
POST   /api/v1/content-types/bootstrap-defaults
POST   /api/v1/content-types
GET    /api/v1/content-types/:id
PATCH  /api/v1/content-types/:id
DELETE /api/v1/content-types/:id
GET    /api/v1/entries?status=&contentTypeId=&cursor=&limit=
POST   /api/v1/entries
GET    /api/v1/entries/:id
PATCH  /api/v1/entries/:id
DELETE /api/v1/entries/:id
POST   /api/v1/entries/:id/publish

# Media (Phase 4) — workspace context required
POST   /api/v1/assets/upload-requests
POST   /api/v1/assets/:id/complete
GET    /api/v1/assets?folderId=&mimeType=&q=&cursor=
GET    /api/v1/assets/:id
DELETE /api/v1/assets/:id
GET    /api/v1/media-folders
POST   /api/v1/media-folders
PATCH  /api/v1/media-folders/:id
DELETE /api/v1/media-folders/:id

# Health
GET /api/v1/health
GET /api/v1/ready
```

### Workspaces & default content types

- **New workspace:** `POST /api/v1/workspaces` automatically adds **Blog Post** (`blog`) and **Page** (`page`) content types.
- **Existing workspace** (created before this behavior): open **Content types** and click **Add default types**, or call `POST /api/v1/content-types/bootstrap-defaults` with workspace context.
- **Dashboard:** owners and admins can **Edit** workspace name/slug; only **owners** can **Delete**. Deleting the active workspace clears the session active workspace on the server.

### Phase 3 manual verify

1. `pnpm db:migrate && pnpm db:seed`
2. Login → dashboard → switch to **Alpha Agency** (seeded `blog` content type + sample entries)
3. Create a new workspace (e.g. **AirOra2**) → **Content types** should list Blog Post + Page without bootstrap
4. For an older workspace (e.g. **AirOra**): **Content types** → **Add default types**
5. Admin UI: `/content-types`, `/entries`, `/entries/new` — entries tab should not stay on “Loading…” when session/API fails (error + link to dashboard)
6. Create entry → **Publish** → check `entry_versions` in DB
7. Viewer role cannot publish (403)

### Phase 4 — Media (MVP)

Uploads use **presigned URLs**: the browser PUTs files directly to MinIO; the API never proxies large files.

1. Ensure `S3_*` vars are set in repo root `.env.local` (see `.env.local.example`).
2. Start Docker (`postgres`, `redis`, `minio`). On API startup, the `cms-dev` bucket is created if missing.
3. **MinIO CORS** (required for browser uploads from `http://localhost:3000`):

```powershell
docker exec cms-minio mc alias set local http://localhost:9000 minio minio123
docker exec cms-minio mc mb local/cms-dev --ignore-existing
docker cp docker/minio-cors.json cms-minio:/tmp/cors.json
docker exec cms-minio mc cors set local/cms-dev /tmp/cors.json
docker exec cms-minio mc anonymous set download local/cms-dev
```

4. `pnpm db:migrate` (applies `0004_media` — `assets`, `media_folders`).
5. Login → active workspace → **Media** tab → upload an image → asset appears in the grid.
6. **Viewer** role: can list assets; upload returns **403**.

Set `S3_PUBLIC_URL=http://localhost:9000/cms-dev` so image thumbnails use public object URLs in dev.

**Detailed setup and troubleshooting:** [docs/engineering/MEDIA_LOCAL_SETUP.md](./docs/engineering/MEDIA_LOCAL_SETUP.md)  
**Future (variants, media field type):** [docs/engineering/PHASE_4B_MEDIA_FUTURE.md](./docs/engineering/PHASE_4B_MEDIA_FUTURE.md)

## Database commands

```bash
pnpm db:migrate    # Apply migrations
pnpm db:seed       # Seed demo users, workspaces, memberships
pnpm db:generate   # Generate migration from schema changes
pnpm db:reset      # Truncate dev tables (destructive)
pnpm db:studio     # Drizzle Studio
```

## Docker

```powershell
# Start services
docker compose -f docker/docker-compose.yml up -d

# Stop and remove volumes
docker compose -f docker/docker-compose.yml down -v
```

## GitHub setup (manual)

After pushing to GitHub:

1. Enable branch protection on `main`
2. Require PR reviews and CI status checks
3. CI runs via `.github/workflows/ci.yml` (lint, typecheck, test, build)

## Documentation

| Doc | Description |
| --- | ------------- |
| [Development Status](./docs/product/DEVELOPMENT_STATUS.md) | Implemented features through Phase 4 |
| [Web Dashboard Guide](./docs/engineering/WEB_DASHBOARD_GUIDE.md) | Day-to-day admin UI usage |
| [CMS Data Model](./docs/engineering/CMS_DATA_MODEL.md) | Workspaces, types, entries, assets |
| [Media Local Setup](./docs/engineering/MEDIA_LOCAL_SETUP.md) | MinIO uploads and CORS |
| [Phase 4b (future)](./docs/engineering/PHASE_4B_MEDIA_FUTURE.md) | Next media work |
| [Local Development Setup](./docs/engineering/LOCAL_DEVELOPMENT_SETUP.md) | Full environment onboarding |
| [Implementation Plan](./docs/product/IMPLEMENTATION_PLAN.md) | Roadmap (Phases 5+) |
| [Repository Architecture](./docs/architecture/REPOSITORY_ARCHITECTURE.md) | Monorepo layout |
