# CMS Platform — Development Roadmap

Checklist of what we **plan to build**. For what is **already shipped**, see [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md).

**Repository:** https://github.com/EDUNEX-OFFICIAL/CMS

---

## Completed (Phases 0–4)

- [x] Monorepo (pnpm, Turborepo, shared packages)
- [x] Docker: PostgreSQL, Redis, MinIO
- [x] API foundation (Express, validation, errors, logging, rate limits)
- [x] Database + Drizzle migrations + RLS
- [x] Firebase auth + session cookies
- [x] Workspaces (CRUD, switch active, invites, RBAC)
- [x] Dashboard: workspace edit/delete, member invite
- [x] Content types (CRUD API, schema validation, default blog/page)
- [x] Entries (CRUD, draft/publish, versions, Tiptap rich text)
- [x] Media MVP (presigned upload, assets, folders, Media tab)
- [x] Admin UI polish (shared header, alerts, nav, page furnish)
- [x] CI: lint, typecheck, test, build (GitHub Actions)
- [x] Core documentation (status, dashboard guide, data model, media setup)

---

## Next up (recommended order)

### Phase 4b — Media enhancements

- [ ] BullMQ job: image variants (thumb, medium, WebP) via `sharp`
- [ ] Store variant URLs in `assets.metadata.variants`
- [ ] `media` / `image` field type on content types + picker in entry editor
- [ ] Presigned GET for private buckets (production-style)

See [PHASE_4B_MEDIA_FUTURE.md](../engineering/PHASE_4B_MEDIA_FUTURE.md).

### Phase 5 — Dashboard foundation

- [ ] Sidebar layout + responsive shell
- [ ] React Query for server state
- [ ] Radix UI primitives integration
- [ ] Centralized API service layer on web
- [ ] Content-type **edit/delete** UI
- [ ] Entry delete from list UI
- [ ] Loading/error boundaries per route group

### Phase 6 — Page builder

- [ ] Block registry + JSON page schema
- [ ] Server/client renderer for blocks
- [ ] Drag-and-drop builder UI
- [ ] Theme tokens / CSS variables
- [ ] Pages + layouts data model

### Phase 7 — SEO

- [ ] Per-entry/page meta, OG, canonical
- [ ] JSON-LD structured data
- [ ] Sitemap + robots.txt generation
- [ ] Redirect management

### Phase 8 — Commerce (foundation)

- [ ] Products, variants, pricing
- [ ] Orders (basic)
- [ ] Storefront product listing (if in scope)

### Phase 9+ — Platform scale (from implementation plan)

- [ ] Storefront: render published CMS + builder pages
- [ ] Public CDN for assets
- [ ] Search (OpenSearch or equivalent)
- [ ] Webhooks (`entry.published`, `asset.uploaded`, etc.)
- [ ] API keys for headless consumers
- [ ] GraphQL (if still in scope)
- [ ] Plugin / extension system
- [ ] Multi-region / production hardening
- [ ] Self-host packaging

---

## Backlog / nice-to-have

- [ ] Email notifications (invites, publish)
- [ ] Audit log for workspace actions
- [ ] Content scheduling (publish at date)
- [ ] Entry version diff UI
- [ ] Virus scan on upload
- [ ] Full-text search in media library
- [ ] i18n for admin UI
- [ ] Dark mode

---

## Out of scope (current MVP)

These are explicitly **not** targeted until later phases:

- Production deployment automation (beyond CI)
- Mobile admin app
- Real-time collaborative editing
- Full ecommerce (payments, tax, shipping integrations)

---

## How to use this doc

| Question | Document |
| -------- | -------- |
| What exists today? | [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) |
| How to run locally? | [LOCAL_DEVELOPMENT_SETUP.md](../engineering/LOCAL_DEVELOPMENT_SETUP.md) |
| Full phase specs | [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) |
| Using the dashboard | [WEB_DASHBOARD_GUIDE.md](../engineering/WEB_DASHBOARD_GUIDE.md) |

When a checkbox item ships, move it to **Completed** in [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) and check it off here.
