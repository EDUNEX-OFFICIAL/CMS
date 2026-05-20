# Architecture Decisions — Locked Foundations

### Version 1.1

---

# Purpose

This document defines the core architectural decisions locked for the initial platform build.

These decisions are intentionally optimized for:

- development velocity
- maintainability
- scalability
- operational simplicity
- future extensibility

Some systems are intentionally phased instead of fully implemented on Day 1 to avoid premature complexity.

---

# Locked Architecture Decisions

| Area | Decision |
| --- | --- |
| Auth | Firebase Auth + backend session validation |
| Tenant Isolation | Shared schema + PostgreSQL RLS |
| Content Model | Hybrid relational + JSONB |
| API | REST first → GraphQL later |
| Media | S3-compatible abstraction |
| Queue | BullMQ initially → Kafka later |
| Search | OpenSearch initially (Elastic-compatible) |
| Editor | Tiptap |
| Builder | JSON block architecture |

---

# Detailed Decisions

---

# 1. Authentication

## Locked Decision

Firebase Auth with backend-controlled session validation.

## Why

- Fast implementation
- Mature authentication ecosystem
- Excellent OAuth provider support
- Reduces authentication engineering overhead
- Strong frontend SDK support
- Works well with Next.js applications

## Architecture

- Firebase handles identity authentication
- Backend validates Firebase ID tokens
- Backend issues internal session validation
- httpOnly cookies used for secure session persistence
- Backend remains source of authorization truth
- RBAC and tenant access handled entirely in backend

## Phase Strategy

### Phase 1

- Email/password authentication
- Google OAuth
- Workspace sessions
- Invite-by-email flow
- Backend JWT/session validation layer

### Later Phases

- Enterprise SSO
- SCIM provisioning
- advanced session controls
- organization-wide auth enforcement
- audit-aware session management

---

# 2. Tenant Isolation

## Locked Decision

Shared PostgreSQL schema using Row-Level Security (RLS).

## Why

- Lowest operational complexity
- Easier scaling during early stages
- Simplifies analytics and querying
- Faster development velocity
- Easier maintenance across tenants

## Architecture

Every tenant-scoped table contains:
