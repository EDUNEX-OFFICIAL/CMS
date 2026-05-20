# Web Dashboard Guide

Operational guide for the **admin dashboard** (`apps/web`, port 3000). Assumes Phase 2–4 features are running locally (`pnpm dev`).

---

## Sign in

1. Open http://localhost:3000/login  
2. Use Firebase email/password, or **dev quick-login** if `NEXT_PUBLIC_DEV_QUICK_LOGINS` is set in repo root `.env.local` (restart `pnpm dev` after env changes).  
3. On success you land on **Workspaces** (`/dashboard`).

---

## Navigation

| Tab | Route | What you do here |
| --- | ----- | ---------------- |
| Workspaces | `/dashboard` | Manage tenants, pick **active** workspace |
| Content types | `/content-types` | Schemas for entries |
| Entries | `/entries` | Draft/published content |
| Media | `/media` | Upload images, PDFs, MP4 |

Every CMS/Media tab requires an **active workspace**. If none is selected, you see a message with a link back to the dashboard.

---

## Workspaces

### Switch active workspace

Use **Switch** on a row. The active workspace drives all CMS and Media API calls (session cookie).

### Create workspace

**Create workspace** form → new workspace is created with default content types (**Blog Post**, **Page**) automatically.

### Edit / delete (RBAC)

| Action | Who |
| ------ | --- |
| Edit name/slug | Owner, admin |
| Delete | Owner only |

Deleting the **active** workspace clears it from your session on the server.

### Invite members

Requires active workspace and owner/admin role. Dev builds show an invite URL in the UI after send.

---

## Content types

### Empty workspace (e.g. older “AirOra”)

Click **Add default types** to create `blog` and `page` templates idempotently.

### Custom type

Open **Create custom type** → add fields (key, label, type). Duplicate field keys are blocked client-side and by API.

### List

Types show as cards with field chips (slug, field count).

---

## Entries

### Prerequisites

At least one content type in the active workspace. Otherwise **New entry** is disabled and a banner links to Content types.

### List

Filter by status and content type. Status shown as badges (draft, published, archived).

### Create / edit

- **New entry:** `/entries/new` — pick type, fill fields, **Save**  
- **Edit:** `/entries/[id]` — **Save**, **Publish** (if not already published)  
- Rich text fields use Tiptap (JSON stored in `data`)

Sticky **Save** / **Publish** bar at bottom on edit screen. **Back to entries** in header.

---

## Media

### Upload

- **Upload files** button, or drag-and-drop on empty grid  
- Allowed: images, PDF, MP4 (size limits enforced by API)  
- Flow: presign → PUT to MinIO → complete → appears in grid  

If upload fails, see [MEDIA_LOCAL_SETUP.md](./MEDIA_LOCAL_SETUP.md).

### Folders

Sidebar: **All assets** or a folder. **New folder** creates under current folder context.

### Copy URL

Ready assets with a public URL show **Copy URL** (dev: requires MinIO anonymous download + `S3_PUBLIC_URL`).

### Viewer role

Can browse assets; upload and delete hidden.

---

## Common issues

| Problem | What to check |
| ------- | ------------- |
| Tabs stuck on “Loading…” | API running? Logged in? `getMe` errors → retry or re-login |
| No content types | Bootstrap defaults or create workspace fresh |
| Media upload fails | MinIO, CORS, `S3_*` in `.env.local` |
| 403 on action | Your role on that workspace (see RBAC) |

---

## See also

- [DEVELOPMENT_STATUS.md](../product/DEVELOPMENT_STATUS.md) — full feature list  
- [CMS_DATA_MODEL.md](./CMS_DATA_MODEL.md) — data relationships  
- [README.md](../../README.md) — API endpoints and quick start  
