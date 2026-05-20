# Coding Conventions Quick Guide

### Version 1.0

### Engineering Rules & Implementation Standards

---

# Purpose

This document defines quick-reference coding conventions, implementation rules, naming standards, and development practices for the CMS platform.

The objective is to:

- standardize implementation
- reduce inconsistent code
- improve maintainability
- simplify reviews
- support AI-assisted development
- improve long-term scalability

This guide acts as the day-to-day implementation reference for all contributors.

---

# Core Engineering Philosophy

Code should prioritize:

- readability
- maintainability
- predictability
- simplicity

NOT:

- cleverness
- overengineering
- unnecessary abstractions
- hidden side effects

---

# General Development Rules

## Preferred Priorities

```
Correctness
→ Readability
→ Maintainability
→ Performance
```

---

# Forbidden Priorities

Avoid optimizing prematurely for:

- hyperscale traffic
- micro-optimizations
- speculative architecture

---

# TypeScript Standards

## Strict Mode Required

Always use:

```
strict: true
```

---

# Forbidden Types

Never use:

```tsx
any
```

---

# Avoid Excessive Type Assertions

Avoid:

```tsx
as any
as unknown as
```

unless absolutely necessary.

---

# Preferred Type Strategy

Prefer:

- inferred types
- shared schemas
- explicit interfaces
- Zod validation

---

# Naming Standards

## Variables

Use:

```
camelCase
```

---

# Functions

Use:

```
camelCase
```

---

# React Components

Use:

```
PascalCase
```

---

# File Names

| Type | Convention |
| --- | --- |
| Components | PascalCase.tsx |
| Utilities | snake_case.ts |
| Services | domain.service.ts |
| Repositories | domain.repository.ts |

---

# Constants

Use:

```
UPPER_SNAKE_CASE
```

---

# Examples

```tsx
MAX_UPLOAD_SIZE
DEFAULT_PAGE_LIMIT
```

---

# Folder Naming

Use:

```
kebab-case
```

---

# Import Standards

## Preferred Imports

Use aliases:

```tsx
@/features/cms
@repo/ui
@repo/db
```

---

# Forbidden Imports

Avoid:

```tsx
../../../../
```

---

# Import Ordering

## Standard Order

```
1. External libraries
2. Internal packages
3. Shared utilities
4. Relative imports
```

---

# Function Standards

## Function Rules

Functions should:

- do one thing
- remain predictable
- remain testable

---

# Forbidden Function Practices

Avoid:

- giant multi-purpose functions
- hidden mutations
- excessive nesting

---

# Function Size Rule

If a function exceeds:

```
~50 lines
```

consider refactoring.

---

# Conditional Logic Rules

Prefer:

- early returns

Avoid:

- deep nested conditionals

---

# Preferred Example

```tsx
if (!workspace) {
  return null;
}
```

---

# Forbidden Example

```tsx
if (workspace) {
  if (user) {
    if (permission) {
    }
  }
}
```

---

# API Route Standards

## Routes Must Stay Thin

Routes should only:

- validate requests
- call services
- return responses

---

# Forbidden Route Logic

Routes must NOT:

- contain business logic
- contain DB queries
- contain permission logic directly

---

# Service Layer Standards

## Services Own Business Logic

Services handle:

- workflows
- orchestration
- validations
- domain rules

---

# Repository Standards

## Repositories Own Database Access

Repositories should:

- contain queries only
- avoid business logic

---

# Forbidden Repository Logic

Avoid:

- permission logic
- workflow orchestration
- external API calls

---

# Validation Standards

## Validation Library

Use:

```
Zod
```

---

# Validation Rules

Validate:

- request body
- params
- query
- env variables
- event payloads

---

# Forbidden Validation Practices

Never trust:

- frontend validation
- client-generated permissions

---

# Error Handling Standards

## Error Philosophy

Errors should:

- remain predictable
- remain typed
- remain centralized

---

# Standard Error Shape

```tsx
{
  code: "VALIDATION_ERROR",
  message: "Invalid input"
}
```

---

# Forbidden Error Practices

Avoid:

- generic throw statements
- leaking internal stack traces
- silent failures

---

# Logging Standards

## Logging Rules

Logs should:

- remain structured
- include request IDs
- include workspace context

---

# Forbidden Logging

Never log:

- passwords
- secrets
- tokens
- payment credentials

---

# Async Standards

## Async Rules

Always:

```tsx
await
```

promises intentionally.

---

# Forbidden Async Practices

Avoid:

- floating promises
- unhandled async errors
- nested async chains

---

# React Standards

## Component Philosophy

Components should:

- remain composable
- remain isolated
- avoid business coupling

---

# Forbidden React Practices

Avoid:

- giant components
- prop drilling chains
- business logic in UI components

---

# Component Size Rule

Large components should split into:

- subcomponents
- hooks
- services

---

# Hook Standards

## Custom Hooks

Custom hooks should:

- encapsulate reusable logic
- remain focused

---

# Forbidden Hook Practices

Avoid:

- hidden side effects
- direct business mutations

---

# State Management Standards

## Preferred State Hierarchy

| State Type | Solution |
| --- | --- |
| Local state | useState |
| Server state | React Query |
| Shared lightweight state | Context |

---

# Forbidden State Practices

Avoid:

- giant global stores
- unnecessary Redux usage

---

# Styling Standards

## Official Styling

Use:

```
Tailwind CSS
```

---

# Styling Rules

Prefer:

- utility-first styling
- reusable UI primitives

---

# Forbidden Styling Practices

Avoid:

- inline styles everywhere
- inconsistent spacing
- arbitrary colors

---

# Database Query Standards

## Query Rules

Queries should:

- remain explicit
- use indexes properly
- avoid SELECT *

---

# Forbidden Query Practices

Avoid:

- N+1 queries
- unrestricted pagination
- cross-tenant queries

---

# Multi-Tenant Standards

## Tenant Rules

Every tenant-scoped query must:

- include workspace validation
- enforce RLS

---

# Security Standards

## Security Rules

Always validate:

- auth
- permissions
- ownership

---

# Forbidden Security Practices

Never:

- trust frontend roles
- bypass permission middleware
- expose internal secrets

---

# Queue Standards

## Queue Rules

Background jobs should:

- remain idempotent
- support retries
- validate payloads

---

# Git Standards

## Branch Naming

```
feat/auth-system
fix/media-upload
refactor/cms-service
```

---

# Commit Format

```
feat: add workspace switching
fix: resolve upload validation
```

---

# Pull Request Standards

## PR Rules

Every PR must:

- pass lint
- pass typecheck
- pass tests
- receive review

---

# Forbidden PR Practices

Never:

- merge broken builds
- bypass reviews
- commit generated secrets

---

# Testing Standards

## Required Tests

Critical flows require:

- integration tests
- auth tests
- RBAC tests
- tenant isolation tests

---

# Documentation Standards

Complex systems require:

- architecture notes
- usage examples
- API documentation

---

# AI-Assisted Development Rules

## AI Usage Philosophy

AI is:

- an accelerator
- not an architect

---

# AI Code Rules

AI-generated code must:

- follow architecture standards
- remain reviewed
- remain tested

---

# Forbidden AI Practices

Never:

- blindly paste AI output
- bypass reviews
- skip validation

---

# Refactoring Standards

## Refactoring Philosophy

Refactor when:

- duplication grows
- readability drops
- domain boundaries blur

---

# Forbidden Refactoring

Avoid:

- unnecessary abstraction
- premature optimization
- architecture rewrites

---

# Performance Standards

## Performance Philosophy

Optimize:

- obvious bottlenecks
- heavy queries
- rendering waterfalls

ONLY when measurable.

---

# Final Principle

The codebase must prioritize:

- clarity
- maintainability
- modularity
- predictable behavior
- long-term scalability

NOT:

- clever code
- premature abstractions
- architecture cosplay
- unnecessary complexity