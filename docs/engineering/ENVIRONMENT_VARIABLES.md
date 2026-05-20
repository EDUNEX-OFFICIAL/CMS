# Environment Variables
### Version 1.0
### Configuration & Secret Management Standards

---

# Purpose

This document defines environment variable standards, secret management policies, configuration structures, naming conventions, and runtime environment governance for the CMS platform.

The objective is to:
- standardize runtime configuration
- prevent secret leakage
- simplify deployments
- ensure environment consistency
- support scalable infrastructure
- improve operational security

This document applies to:
- local development
- staging
- production
- CI/CD systems
- cloud infrastructure
- backend services
- frontend applications

---

# Configuration Philosophy

Environment configuration must be:
- explicit
- validated
- environment-specific
- secure
- reproducible

Configuration should NEVER:
- rely on hidden machine state
- contain hardcoded secrets
- depend on undocumented values

---

# Core Principles

## 1. Secrets Never Live In Code

Secrets must NEVER:
- exist in repositories
- exist in frontend bundles
- exist in source code
- exist in Git history

---

## 2. Environment Isolation

Each environment must use:
- isolated configuration
- isolated credentials
- isolated databases

---

## 3. Explicit Validation

All environment variables must:
- validate on startup
- fail fast if invalid
- use typed schemas

---

## 4. Principle of Least Exposure

Frontend applications should only expose:
- explicitly public variables

---

# Environment Structure

## Supported Environments

| Environment | Purpose |
|---|---|
| local | Developer machines |
| staging | Pre-production testing |
| production | Live production |

---

# Required Environment Files

```txt
.env.local
.env.staging
.env.production
```

---

# Forbidden Files

Never commit:

```txt
.env.production
.env.staging
```

---

# Environment Loading Strategy

## Frontend Variables

Frontend-safe variables must use:

```txt
NEXT_PUBLIC_
```

---

# Example

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

# Backend Variables

Backend-only secrets should NEVER use:
```txt
NEXT_PUBLIC_
```

---

# Environment Validation

## Validation Library

Use:
```txt
Zod
```

---

# Validation Rules

All applications must:
- validate env variables at startup
- crash early if invalid

---

# Example Validation

```ts
const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
});
```

---

# Root Environment Variables

## Shared Variables

```env
NODE_ENV=development

APP_NAME=CMS Platform

LOG_LEVEL=debug
```

---

# Database Configuration

## PostgreSQL

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cms_dev
```

---

# Database Rules

Each environment must use:
- separate databases
- separate credentials

---

# Forbidden Practices

Never:
- share production databases locally
- use production credentials in development

---

# Redis Configuration

## Redis URL

```env
REDIS_URL=redis://localhost:6379
```

---

# Redis Usage

Redis powers:
- BullMQ
- caching
- sessions
- async jobs

---

# Firebase Configuration

## Firebase Variables

```env
FIREBASE_PROJECT_ID=your_project_id

FIREBASE_CLIENT_EMAIL=your_client_email

FIREBASE_PRIVATE_KEY=your_private_key
```

---

# Firebase Security Rules

Firebase credentials must:
- remain backend-only
- never expose private keys publicly

---

# JWT Configuration

## JWT Secret

```env
JWT_SECRET=super_secret_key
```

---

# JWT Rules

JWT secrets must:
- remain long and random
- rotate periodically
- differ per environment

---

# Frontend Configuration

## Public API URL

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

# Public Variable Rules

Only expose variables that are:
- safe publicly
- non-sensitive

---

# Forbidden Public Variables

Never expose:
- API secrets
- DB credentials
- private keys
- internal tokens

---

# Storage Configuration

## S3-Compatible Storage

```env
S3_ACCESS_KEY=minio

S3_SECRET_KEY=minio123

S3_BUCKET=cms-dev

S3_ENDPOINT=http://localhost:9000
```

---

# Storage Rules

Buckets should remain:
- environment-isolated
- access-controlled

---

# Queue Configuration

## BullMQ

```env
QUEUE_PREFIX=cms
```

---

# Queue Rules

Queues should:
- remain environment-separated
- avoid cross-environment collisions

---

# API Configuration

## API Base URL

```env
API_BASE_URL=http://localhost:4000
```

---

# Rate Limiting Configuration

```env
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=100
```

---

# Security Configuration

## Session Cookie Settings

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

---

# Security Rules

Production must always use:
```txt
Secure Cookies
HTTPS
```

---

# Logging Configuration

## Logging Variables

```env
LOG_LEVEL=debug
```

---

# Supported Levels

| Level | Usage |
|---|---|
| debug | Local development |
| info | Standard runtime |
| warn | Warnings |
| error | Failures |

---

# Analytics Configuration

## Analytics Variables

```env
ANALYTICS_ENABLED=true
```

---

# Monitoring Configuration

## Monitoring Variables

```env
SENTRY_DSN=your_sentry_dsn
```

---

# Email Configuration

## SMTP Variables

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=user
SMTP_PASS=password
```

---

# Email Rules

Production email providers should:
- remain isolated
- use verified domains

---

# Stripe Configuration

## Stripe Variables

```env
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

# Stripe Security Rules

Stripe secrets must:
- remain backend-only
- never expose secret keys publicly

---

# Feature Flag Configuration

## Feature Flags

```env
FEATURE_BUILDER=true
FEATURE_COMMERCE=false
```

---

# Feature Flag Rules

Flags should support:
- gradual rollout
- safe testing
- staged releases

---

# CI/CD Environment Variables

## CI Requirements

CI systems must securely manage:
- secrets
- deployment tokens
- production credentials

---

# Forbidden Practices

Never:
- hardcode secrets in pipelines
- echo secrets in logs
- expose secrets in builds

---

# Docker Environment Standards

## Docker Env Files

```txt
.env.docker
```

---

# Docker Rules

Containers should:
- load environment variables explicitly
- avoid baked-in secrets

---

# Environment Naming Standards

## Variable Format

Use:
```txt
UPPER_SNAKE_CASE
```

---

# Examples

```txt
DATABASE_URL
JWT_SECRET
REDIS_URL
```

---

# Secret Rotation Standards

## Rotation Policy

Sensitive secrets should support:
- periodic rotation
- revocation
- environment isolation

---

# Backup & Recovery Variables

## Backup Config

```env
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
```

---

# Future Infrastructure Variables

Future variables may support:
- Kubernetes
- distributed workers
- multi-region deployments
- service discovery

These are intentionally deferred until:
- infrastructure scaling
- operational maturity

---

# Example Local Environment

## Example `.env.local`

```env
NODE_ENV=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cms_dev

REDIS_URL=redis://localhost:6379

JWT_SECRET=super_secret_key

NEXT_PUBLIC_API_URL=http://localhost:4000

FIREBASE_PROJECT_ID=my_project

S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=cms-dev
S3_ENDPOINT=http://localhost:9000
```

---

# Example Production Environment

## Example `.env.production`

```env
NODE_ENV=production

DATABASE_URL=${PRODUCTION_DATABASE_URL}

REDIS_URL=${PRODUCTION_REDIS_URL}

JWT_SECRET=${PRODUCTION_JWT_SECRET}

NEXT_PUBLIC_API_URL=https://api.cms.com
```

---

# Environment Validation Startup Rule

Applications must:
- validate env variables before startup
- refuse boot if required values missing

---

# Recommended Validation Flow

```txt
Load Env
→ Validate Schema
→ Fail Fast If Invalid
→ Start Application
```

---

# Forbidden Configuration Practices

Never:
- commit secrets
- reuse production credentials
- bypass validation
- hardcode infrastructure values
- expose private envs publicly

---

# Final Principle

Environment configuration must prioritize:
- security
- predictability
- environment isolation
- operational safety
- scalability

NOT:
- hidden machine configuration
- hardcoded credentials
- undocumented secrets
- inconsistent runtime behavior