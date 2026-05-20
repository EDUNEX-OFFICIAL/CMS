# Repository Structure
### Version 1.0
### Monorepo Architecture & Code Organization Standards

---

# Purpose

This document defines the repository structure, folder ownership, package boundaries, shared code rules, and monorepo organization standards for the CMS platform.

The objective is to:
- maintain scalable code organization
- prevent architectural drift
- standardize module placement
- improve maintainability
- reduce coupling
- support AI-assisted development safely

This document acts as the authoritative source for:
- repository layout
- package ownership
- import boundaries
- app separation
- shared package governance

---

# Repository Philosophy

The platform uses a:

## Modular Monorepo Architecture

The repository is organized to:
- isolate domains
- share reusable packages
- reduce duplication
- standardize tooling
- simplify scaling

The monorepo is intentionally optimized for:
- internal coordination
- shared type safety
- rapid development
- future scalability

WITHOUT introducing:
- premature microservices
- fragmented repositories
- deployment complexity

---

# Core Monorepo Principles

## 1. Clear Ownership

Every directory must have:
- clear responsibility
- predictable ownership
- isolated concerns

---

## 2. Shared Logic Belongs in Packages

Reusable logic belongs in:
```txt
/packages
```

NOT duplicated across apps.

---

## 3. Apps Consume Packages

Applications should:
- consume shared packages
- avoid duplicating infrastructure logic

---

## 4. Domain Isolation

Business domains should remain:
- modular
- isolated
- independently maintainable

---

# Root Repository Structure

```txt
/
├── apps/
├── packages/
├── infrastructure/
├── scripts/
├── docs/
├── .github/
├── docker/
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

# Root Folder Responsibilities

| Folder | Responsibility |
|---|---|
| apps | Main applications |
| packages | Shared reusable packages |
| infrastructure | Infra configs & deployment |
| scripts | Automation scripts |
| docs | Documentation |
| .github | CI/CD workflows |
| docker | Docker configuration |

---

# Package Manager Standard

## Official Package Manager

Use:
```txt
pnpm
```

---

# Build System Standard

## Monorepo Build Tool

Use:
```txt
Turborepo
```

---

# Application Structure

## Apps Directory

```txt
/apps
  /web
  /api
  /storefront
```

---

# App Responsibilities

| App | Responsibility |
|---|---|
| web | Admin dashboard |
| api | Backend APIs |
| storefront | Public website rendering |

---

# 1. Web App Structure

## Path

```txt
/apps/web
```

---

# Responsibilities

Owns:
- admin dashboard
- CMS UI
- builder UI
- media management UI
- workspace management UI

---

# Recommended Structure

```txt
/apps/web/src
  /app
  /components
  /features
  /hooks
  /providers
  /services
  /styles
  /types
```

---

# Feature Structure

```txt
/features
  /auth
  /cms
  /builder
  /media
  /commerce
```

---

# Forbidden Practices

Avoid:
- giant shared utils folders
- business logic inside components
- random feature placement

---

# 2. API App Structure

## Path

```txt
/apps/api
```

---

# Responsibilities

Owns:
- REST APIs
- auth validation
- business logic orchestration
- queue orchestration
- domain services

---

# API Structure

```txt
/apps/api/src
  /modules
  /middleware
  /config
  /lib
  /queues
  /events
  /utils
```

---

# Module Structure

Every module must follow:

```txt
/modules
  /domain-name
    /routes
    /services
    /repositories
    /validators
    /events
    /types
    /utils
```

---

# Forbidden Practices

Do NOT:
- mix domains together
- access DB directly from routes
- place business logic in controllers

---

# 3. Storefront Structure

## Path

```txt
/apps/storefront
```

---

# Responsibilities

Owns:
- public frontend rendering
- SEO rendering
- page rendering
- storefront UI
- public commerce rendering

---

# Storefront Structure

```txt
/apps/storefront/src
  /app
  /components
  /features
  /themes
  /renderers
```

---

# Shared Package Structure

## Packages Directory

```txt
/packages
```

---

# Shared Packages

```txt
/packages
  /ui
  /db
  /shared
  /config
  /types
```

---

# Package Responsibilities

| Package | Responsibility |
|---|---|
| ui | Shared UI components |
| db | Database schema & ORM |
| shared | Shared utilities |
| config | Shared configs |
| types | Shared TypeScript types |

---

# 1. UI Package

## Path

```txt
/packages/ui
```

---

# Responsibilities

Owns:
- reusable UI components
- design primitives
- shared styling utilities

---

# Allowed Components

Examples:
- Button
- Modal
- Dialog
- Input
- Card
- Tabs

---

# Forbidden Logic

UI package must NOT contain:
- API calls
- CMS logic
- business workflows
- domain mutations

---

# 2. Database Package

## Path

```txt
/packages/db
```

---

# Responsibilities

Owns:
- Drizzle schema
- migrations
- DB utilities
- query helpers

---

# Structure

```txt
/packages/db
  /schema
  /migrations
  /queries
  /utils
```

---

# Forbidden Practices

Do NOT:
- place business logic here
- place RBAC logic here
- place workflow logic here

---

# 3. Shared Package

## Path

```txt
/packages/shared
```

---

# Responsibilities

Owns:
- shared utilities
- constants
- helper functions

---

# Forbidden Shared Logic

Avoid:
- giant miscellaneous utility dumping
- domain-specific logic leakage

---

# 4. Config Package

## Path

```txt
/packages/config
```

---

# Responsibilities

Owns:
- ESLint config
- TypeScript config
- Tailwind config
- Prettier config

---

# Infrastructure Structure

## Infrastructure Directory

```txt
/infrastructure
```

---

# Responsibilities

Owns:
- deployment configs
- Redis configs
- Docker configs
- cloud infrastructure
- monitoring configs

---

# Structure

```txt
/infrastructure
  /docker
  /redis
  /monitoring
  /nginx
```

---

# Documentation Structure

## Docs Directory

```txt
/docs
```

---

# Recommended Structure

See [DOCS_ARCHITECTURE.md](../DOCS_ARCHITECTURE.md) for the authoritative documentation tree.

```txt
/docs
  DOCS_ARCHITECTURE.md
  README.md
  /architecture
  /engineering
  /product
```

`/operations` is reserved for future runbooks and is not used in v1.

---

# Import Standards

## Import Direction Rules

Allowed:

```txt
apps → packages
```

Allowed:

```txt
features → shared
```

---

# Forbidden Import Rules

Forbidden:

```txt
packages → apps
```

Forbidden:

```txt
cross-domain direct repository imports
```

---

# Alias Standards

## Required Aliases

Use aliases instead of deep relative imports.

Examples:

```txt
@/components
@/features
@repo/ui
@repo/db
```

---

# Environment Standards

## Required Environment Files

```txt
.env.local
.env.staging
.env.production
```

---

# Forbidden Practices

Never commit:
```txt
.env.production
```

---

# Script Standards

## Scripts Directory

```txt
/scripts
```

---

# Responsibilities

Owns:
- setup scripts
- migration scripts
- automation utilities

---

# CI/CD Structure

## GitHub Actions

```txt
/.github/workflows
```

---

# Required Pipelines

Pipelines required for:
- lint
- typecheck
- tests
- builds

---

# Docker Standards

## Docker Structure

```txt
/docker
```

---

# Required Files

```txt
Dockerfile
docker-compose.yml
```

---

# Naming Standards

## Folder Naming

Use:
```txt
kebab-case
```

---

# File Naming

## React Components

Use:
```txt
PascalCase.tsx
```

---

## Utility Files

Use:
```txt
snake_case.ts
```

---

# Testing Structure

## Test Placement

Tests should exist near source files.

Example:

```txt
cms.service.ts
cms.service.test.ts
```

---

# Forbidden Repository Practices

Never:
- create giant shared folders
- duplicate domain logic
- place random utilities globally
- bypass package boundaries
- create circular imports

---

# Future Scalability Strategy

The repository structure should support future:
- service extraction
- plugin systems
- white-labeling
- multiple frontend apps
- SDK generation

WITHOUT requiring:
- repo rewrites
- package restructuring
- architecture migration

---

# Final Principle

The repository structure must prioritize:
- maintainability
- modularity
- predictable ownership
- scalable organization
- developer productivity

NOT:
- overengineering
- premature service fragmentation
- random folder growth
- architecture inconsistency