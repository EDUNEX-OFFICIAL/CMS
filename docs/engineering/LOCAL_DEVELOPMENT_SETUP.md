# Local Development Setup
### Version 1.0
### Development Environment & Onboarding Standards

---

# Purpose

This document defines the local development environment setup, installation process, required tooling, environment configuration, and onboarding workflow for the CMS platform.

The objective is to:
- standardize development environments
- reduce onboarding friction
- prevent environment inconsistencies
- simplify local execution
- ensure reproducible development setups

This document applies to:
- frontend developers
- backend developers
- DevOps contributors
- AI-assisted development workflows

> **Repository note:** This repo’s Docker Compose exposes PostgreSQL on host port **5433** (not 5432). Copy [`.env.local.example`](../../.env.local.example) for the correct `DATABASE_URL`. For a feature-level overview of what is implemented, see [DEVELOPMENT_STATUS.md](../product/DEVELOPMENT_STATUS.md).

---

# Development Philosophy

The local development environment should be:
- reproducible
- predictable
- fast
- containerized where practical
- easy to onboard

No developer should require:
- manual infrastructure setup
- custom machine-specific hacks
- undocumented configuration

---

# Core Development Stack

| Tool | Purpose |
|---|---|
| Node.js | Runtime |
| pnpm | Package manager |
| Turborepo | Monorepo orchestration |
| Docker | Local infrastructure |
| PostgreSQL | Database |
| Redis | Queue & cache |
| Firebase | Authentication |
| Drizzle ORM | Database ORM |

---

# System Requirements

## Minimum Requirements

| Requirement | Minimum |
|---|---|
| RAM | 8 GB |
| CPU | 4 cores |
| Node.js | v20+ |
| Docker | Latest stable |
| pnpm | v9+ |

---

# Required Software

## Install Required Tools

### Node.js

Install:
```txt
Node.js v20+
```

Recommended:
```txt
nvm
```

---

### pnpm

Install globally:

```bash
npm install -g pnpm
```

---

### Docker

Install:
```txt
Docker Desktop
```

Required for:
- PostgreSQL
- Redis
- local services

---

### Git

Install:
```txt
Git
```

---

# Repository Setup

## Clone Repository

```bash
git clone <repository-url>
```

---

## Enter Project

```bash
cd cms-platform
```

---

# Package Installation

## Install Dependencies

```bash
pnpm install
```

---

# Monorepo Structure

```txt
/apps
/packages
/docs
/infrastructure
/scripts
```

---

# Environment Variables Setup

## Create Environment Files

Required files:

```txt
.env.local
.env.staging
.env.production
```

---

# Local Environment Example

## Root `.env.local`

```env
NODE_ENV=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cms_dev

REDIS_URL=redis://localhost:6379

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

JWT_SECRET=super_secret_key

S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=cms-dev
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_PUBLIC_URL=http://localhost:9000/cms-dev

NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_*=...
NEXT_PUBLIC_DEV_QUICK_LOGINS=...
```

---

# Docker Setup

## Start Infrastructure

```bash
docker-compose up -d
```

---

# Local Services

| Service | Port |
|---|---|
| PostgreSQL (host) | 5433 (Docker maps to 5432 inside container) |
| Redis | 6379 |
| MinIO API | 9000 |
| MinIO Console | 9001 |
| API | 4000 |
| Web | 3000 |
| Storefront (stub) | 3001 |

---

# Docker Compose Responsibilities

The local Docker environment provides:
- PostgreSQL
- Redis
- MinIO
- supporting infrastructure

---

# Database Setup

## Run Migrations

```bash
pnpm db:migrate
```

---

# Seed Development Data

```bash
pnpm db:seed
```

---

# Database Reset

```bash
pnpm db:reset
```

---

# Drizzle Commands

## Generate Migration

```bash
pnpm db:generate
```

---

## Push Schema

```bash
pnpm db:push
```

---

## Open Studio

```bash
pnpm db:studio
```

---

# Running Applications

## Start Development Mode

```bash
pnpm dev
```

---

# Expected Development Ports

| Application | URL |
|---|---|
| Web Dashboard | http://localhost:3000 |
| API Server | http://localhost:4000 |
| MinIO Console | http://localhost:9001 |

---

# Turborepo Commands

## Run All Apps

```bash
pnpm dev
```

---

## Run Specific App

```bash
pnpm --filter web dev
```

---

# Build Commands

## Full Build

```bash
pnpm build
```

---

## Build Specific App

```bash
pnpm --filter api build
```

---

# Linting Standards

## Run ESLint

```bash
pnpm lint
```

---

# Type Checking

## Run TypeScript Validation

```bash
pnpm typecheck
```

---

# Formatting Standards

## Run Prettier

```bash
pnpm format
```

---

# Testing Commands

## Run Tests

```bash
pnpm test
```

---

## Run Integration Tests

```bash
pnpm test:integration
```

---

# Git Hooks

## Husky

Git hooks enforce:
- linting
- formatting
- type checking

before commits.

---

# Branching Strategy

## Branch Naming

Format:

```txt
feat/auth-system
fix/media-upload
refactor/cms-service
```

---

# Recommended VSCode Extensions

## Required Extensions

| Extension | Purpose |
|---|---|
| ESLint | Linting |
| Prettier | Formatting |
| Tailwind CSS IntelliSense | Styling |
| Docker | Containers |
| Prisma/SQL Tools | DB Support |

---

# VSCode Settings

## Recommended Workspace Settings

```json
{
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

# Firebase Local Setup

## Firebase Requirements

Configure:
- Firebase project
- service account credentials
- OAuth providers

---

# Firebase Emulator

Optional future support:
```txt
Firebase Emulator Suite
```

Deferred initially.

---

# MinIO Local Setup

## MinIO Usage

Local S3-compatible storage used for:
- media uploads
- asset testing
- local development parity

---

# Access URLs

| Service | URL |
|---|---|
| MinIO API | http://localhost:9000 |
| MinIO Console | http://localhost:9001 |

---

# Queue Development

## BullMQ Dashboard

Optional local dashboard:
```txt
Bull Board
```

---

# Queue Requirements

Redis must remain active for:
- queues
- async jobs
- background workers

---

# Logging Standards

## Local Logging

Development logs should:
- remain readable
- remain structured
- include request IDs

---

# Recommended Development Workflow

## Daily Workflow

```txt
Pull latest changes
→ Install dependencies
→ Run Docker services
→ Run migrations
→ Start apps
```

---

# Pull Request Workflow

```txt
Create branch
→ Implement feature
→ Run tests
→ Open PR
→ Review
→ Merge
```

---

# Forbidden Development Practices

Never:
- commit secrets
- bypass linting
- disable type checking
- manually patch databases
- use production credentials locally

---

# Troubleshooting Guide

## Common Issues

### Port Already In Use

Check running processes:

```bash
lsof -i :3000
```

---

### Reset Docker Environment

```bash
docker-compose down -v
```

---

### Reset Dependencies

```bash
rm -rf node_modules
pnpm install
```

---

# Local Performance Recommendations

Recommended:
- SSD storage
- Docker resource limits
- Node memory optimization

---

# Future Environment Expansion

Future environments may include:
- preview deployments
- isolated feature environments
- staging infrastructure
- production replicas

These are deferred until:
- team scaling
- CI/CD maturity
- operational demand

---

# Final Principle

The local development environment must prioritize:
- reproducibility
- developer productivity
- consistency
- onboarding speed
- operational simplicity

NOT:
- machine-specific hacks
- undocumented workflows
- inconsistent tooling
- fragile setup processes