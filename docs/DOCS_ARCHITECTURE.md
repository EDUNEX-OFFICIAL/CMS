# Documentation Architecture

### Version 1.0

---

# Purpose

This document defines how CMS platform documentation is organized under `/docs`.

Use it to decide where new documents belong and how files should be named.

---

# Naming Rules

- Use `UPPER_SNAKE_CASE.md` for all documentation files
- Place every document inside exactly one top-level folder: `architecture`, `product`, or `engineering`
- Keep `DOCS_ARCHITECTURE.md` and `README.md` at the `/docs` root only

---

# Folder Taxonomy

## `/docs/architecture`

Locked system design, cross-cutting standards, and structural decisions.

| File | Topic |
| --- | --- |
| `ARCHITECTURE_LOCKS.md` | Locked foundation decisions (auth, tenancy, API, media, queue, search) |
| `DOMAIN_ARCHITECTURE.md` | Domain modules, boundaries, and data ownership |
| `API_STANDARDS.md` | REST/API conventions and contracts |
| `DATABASE_STANDARDS.md` | Schema, migrations, and data access rules |
| `SECURITY_BASELINE.md` | Platform security requirements |
| `DEPLOYMENT_ARCHITECTURE.md` | Hosting, CI/CD, environments, and infra topology |
| `FRONTEND_ARCHITECTURE.md` | Web app structure, rendering, and client patterns |
| `REPOSITORY_ARCHITECTURE.md` | Monorepo layout, packages, and import boundaries |
| `RBAC_PERMISSION_MATRIX.md` | Roles, permissions, and authorization matrix |

## `/docs/product`

Product definition, scope boundaries, and delivery planning.

| File | Topic |
| --- | --- |
| `PRODUCT_POSITIONING.md` | Vision, pillars, and competitive positioning |
| `MVP_SCOPE_AND_BOUNDARIES.md` | MVP scope, stage, and execution constraints |
| `IMPLEMENTATION_PLAN.md` | Phased delivery plan and milestones |
| `DEVELOPMENT_STATUS.md` | Implemented phases, routes, DB, and feature matrix |

## `/docs/engineering`

Day-to-day development standards, tooling, and implementation guides.

| File | Topic |
| --- | --- |
| `ENGINEERING_STANDARDS.md` | Core engineering principles and monorepo overview |
| `CODING_CONVENTIONS.md` | TypeScript, React, API, and style conventions |
| `ERROR_HANDLING.md` | Error taxonomy, formats, and handling rules |
| `TESTING_SYSTEM.md` | Testing layers, tools, and coverage expectations |
| `UI_DESIGN_SYSTEM.md` | Tokens, components, and dashboard UX standards |
| `ENVIRONMENT_VARIABLES.md` | Config, secrets, and env validation |
| `LOCAL_DEVELOPMENT_SETUP.md` | Local stack, Docker, and dev workflow |
| `WEB_DASHBOARD_GUIDE.md` | Admin UI: workspaces, CMS, media |
| `CMS_DATA_MODEL.md` | Workspace, content types, entries, assets |
| `MEDIA_LOCAL_SETUP.md` | MinIO presigned uploads and troubleshooting |
| `PHASE_4B_MEDIA_FUTURE.md` | Deferred media features (variants, picker) |

---

# Documentation Tree

```txt
/docs
  DOCS_ARCHITECTURE.md
  README.md

  /architecture
    ARCHITECTURE_LOCKS.md
    DOMAIN_ARCHITECTURE.md
    API_STANDARDS.md
    DATABASE_STANDARDS.md
    SECURITY_BASELINE.md
    DEPLOYMENT_ARCHITECTURE.md
    FRONTEND_ARCHITECTURE.md
    REPOSITORY_ARCHITECTURE.md
    RBAC_PERMISSION_MATRIX.md

  /product
    PRODUCT_POSITIONING.md
    MVP_SCOPE_AND_BOUNDARIES.md
    IMPLEMENTATION_PLAN.md
    DEVELOPMENT_STATUS.md

  /engineering
    ENGINEERING_STANDARDS.md
    CODING_CONVENTIONS.md
    ERROR_HANDLING.md
    TESTING_SYSTEM.md
    UI_DESIGN_SYSTEM.md
    ENVIRONMENT_VARIABLES.md
    LOCAL_DEVELOPMENT_SETUP.md
    WEB_DASHBOARD_GUIDE.md
    CMS_DATA_MODEL.md
    MEDIA_LOCAL_SETUP.md
    PHASE_4B_MEDIA_FUTURE.md
```

---

# Where to Add New Docs

| If the document is about… | Put it in… |
| --- | --- |
| System design, infra, security, API/DB contracts | `architecture/` |
| Vision, roadmap, scope, phases, product rules | `product/` |
| Coding, testing, local dev, UI implementation | `engineering/` |

Future operational runbooks (on-call, incident response, SLOs) may live under `/docs/operations` when introduced; that folder is reserved and not used in v1.
