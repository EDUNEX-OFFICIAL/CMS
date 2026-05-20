# Database Standards
### Version 1.0
### PostgreSQL Governance & Persistence Standards

---

# Purpose

This document defines database architecture rules, schema conventions, migration standards, indexing policies, tenant isolation rules, and persistence governance for the CMS platform.

The objective is to:
- maintain database consistency
- prevent schema drift
- enforce tenant isolation
- support scalability
- improve maintainability
- reduce operational risk

These standards apply to:
- PostgreSQL schema design
- migrations
- indexing
- JSONB usage
- Row-Level Security (RLS)
- performance optimization

---

# Database Philosophy

The platform uses:

- PostgreSQL
- shared-schema multi-tenancy
- Row-Level Security (RLS)
- hybrid relational + JSONB modeling

The database is treated as:
- a critical system boundary
- a source of truth
- a security enforcement layer

NOT:
- a passive storage layer
- an unstructured dumping ground

---

# Core Principles

## 1. Tenant Isolation Is Mandatory

All tenant-scoped tables MUST:
- contain `workspace_id`
- enforce RLS
- validate tenant ownership

No exceptions.

---

## 2. Relational First, JSONB Second

Use:
- relational columns for structured/queryable data
- JSONB only for flexible schemas

Avoid storing critical relational data inside JSONB.

---

## 3. Explicit Schemas

All schema changes:
- require migrations
- require review
- require rollback capability

No manual production schema changes.

---

## 4. Predictable Naming

Naming conventions must remain:
- consistent
- searchable
- scalable

---

# Database Engine

## Primary Database

```txt
PostgreSQL

# ORM Standard

## Official ORM

```
Drizzle ORM
```

---

# Table Naming Standards

## Format

Use:

- snake_case
- plural table names

---

## Examples

```
users
workspaces
content_types
entries
workspace_members
product_variants
```

---

# Column Naming Standards

## Format

Use:

- snake_case

---

## Examples

```
created_at
updated_at
workspace_id
published_at
```

---

# Primary Key Standards

## ID Strategy

Use:

- UUIDs

---

## Format

```
id UUIDPRIMARYKEY
```

---

## Rules

Never expose:

- auto-incrementing internal IDs publicly

UUIDs required for:

- security
- distributed safety
- future scalability

---

# Required Audit Columns

Every major table MUST contain:

```
id
created_at
updated_at
workspace_id
```

---

# Optional Audit Columns

Recommended where appropriate:

```
created_by
updated_by
deleted_at
```

---

# Timestamp Standards

## Standard Format

Use:

```
TIMESTAMPTZ
```

---

## Timezone Rule

All timestamps stored in:

```
UTC
```

Frontend handles localization.

---

# Soft Delete Standards

## Preferred Strategy

Use:

```
deleted_at TIMESTAMPTZNULL
```

instead of hard deletes.

---

## Exceptions

Hard deletes allowed only for:

- temporary tokens
- cache tables
- ephemeral data

---

# Tenant Isolation Standards

## Required Tenant Column

All tenant-scoped tables MUST contain:

```
workspace_id UUIDNOTNULL
```

---

# Row-Level Security Standards

## Mandatory RLS

Every tenant-scoped table MUST:

- enable RLS
- define tenant policies

---

## Example

```
ALTERTABLE entries ENABLEROWLEVEL SECURITY;
```

---

## Example Policy

```
CREATE POLICY workspace_isolation
ON entries
USING (
  workspace_id=
  current_setting('app.workspace_id')::uuid
);
```

---

# Forbidden Practices

NEVER:

- bypass RLS in application logic
- disable RLS temporarily
- use global unrestricted queries

---

# JSONB Standards

## Allowed Usage

JSONB allowed for:

- flexible schemas
- builder blocks
- metadata
- dynamic configuration

---

## Examples

```
data JSONB
schema JSONB
meta JSONB
blocks JSONB
```

---

# Forbidden JSONB Usage

Do NOT store:

- relational joins
- permission systems
- critical query fields
- financial calculations

inside JSONB.

---

# JSONB Indexing Rules

Frequently queried JSONB fields MUST:

- use GIN indexes

---

## Example

```
CREATE INDEX idx_entries_data
ON entries
USING GIN(data);
```

---

# Foreign Key Standards

## Mandatory FK Constraints

All relationships must use:

- explicit foreign keys

---

## Example

```
workspace_id UUIDREFERENCES workspaces(id)
```

---

# Indexing Standards

## Required Indexes

Every table should index:

- foreign keys
- frequently filtered fields
- sorting fields

---

## Common Index Examples

```
CREATE INDEX idx_entries_workspace_id
ON entries(workspace_id);
```

---

## Composite Index Rules

Use composite indexes for:

- common filter + sort patterns

---

## Example

```
CREATE INDEX idx_entries_workspace_status
ON entries(workspace_id, status);
```

---

# Unique Constraint Standards

## Required Unique Constraints

Use explicit uniqueness rules.

---

## Examples

```
UNIQUE(workspace_id, slug)
```

---

# Migration Standards

## Migration Rules

All schema changes require:

- versioned migrations
- rollback strategy
- review before production

---

# Forbidden Practices

NEVER:

- edit old migrations
- manually patch production schema
- skip migration reviews

---

# Migration Naming

## Format

```
20260101_create_entries_table.sql
```

---

# Data Ownership Rules

Every table must have:

- one authoritative domain owner

---

## Example

| Table | Owner |
| --- | --- |
| entries | CMS |
| pages | Builder |
| products | Commerce |
| assets | Media |

---

# Query Standards

## Repository Pattern Required

Database access must occur through:

- repositories
- query services

NOT directly from:

- routes
- controllers
- UI logic

---

# Transaction Standards

## Required Transactions

Use transactions for:

- multi-step mutations
- order processing
- publishing workflows
- billing operations

---

## Example

```
BEGIN;
COMMIT;
ROLLBACK;
```

---

# Performance Standards

## Query Rules

Avoid:

- N+1 queries
- unrestricted SELECT *
- unbounded pagination

---

## Required Practices

Prefer:

- explicit column selection
- cursor pagination
- indexed filters

---

# Partitioning Standards

## Future Partitioning

Large append-only tables may later use:

- monthly partitioning

Examples:

- analytics_events
- audit_logs

---

# Caching Standards

## Cache Ownership

Caching must NEVER:

- become source of truth

Redis exists only for:

- acceleration
- temporary storage
- queue systems

---

# Audit Logging Standards

Critical systems should log:

- mutations
- permission changes
- publishing actions
- billing actions

---

# Backup Standards

## Required Policies

Production databases require:

- automated backups
- point-in-time recovery
- backup verification

---

# Environment Standards

## Required Environments

Separate databases required for:

- local
- staging
- production

Never share environments.

---

# Security Standards

## Sensitive Data Rules

Never store:

- plaintext passwords
- raw secrets
- payment credentials

---

## Encryption Rules

Sensitive fields may require:

- encryption at rest
- hashing
- tokenization

---

# Future Scalability Standards

The database should support future:

- read replicas
- partitioning
- analytics isolation
- regional deployments

WITHOUT:

- requiring schema rewrites

---

# Final Principle

The database is a strategic system layer.

The database architecture must prioritize:

- consistency
- security
- maintainability
- tenant isolation
- predictable scalability

NOT:

- shortcut implementations
- schema inconsistency
- unreviewed migrations
- uncontrolled JSONB usage