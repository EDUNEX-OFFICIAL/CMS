# API Standards
### Version 1.0
### REST API Governance & Communication Standards

---

# Purpose

This document defines API architecture standards, communication contracts, request/response structures, validation rules, authentication flows, and integration conventions for the CMS platform.

The objective is to:
- standardize API behavior
- improve frontend/backend consistency
- prevent API drift
- simplify integrations
- improve maintainability
- support future scalability

These standards apply to:
- internal APIs
- public APIs
- admin APIs
- plugin APIs
- future SDKs
- webhook systems

---

# API Philosophy

The platform follows a:

## REST-First API Strategy

REST APIs are prioritized during MVP because they provide:
- predictable architecture
- easier debugging
- easier caching
- faster implementation
- lower complexity
- simpler frontend integration

GraphQL will be introduced later for:
- advanced querying
- flexible integrations
- ecosystem expansion

---

# API Design Principles

## 1. Predictability

All APIs must:
- follow consistent naming
- follow standardized responses
- follow shared validation rules

No endpoint should behave unpredictably.

---

## 2. Resource-Oriented Design

Endpoints represent resources.

Examples:

```txt
/api/v1/entries
/api/v1/assets
/api/v1/products

NOT actions:

```
/api/createEntry
/api/deleteProduct
```

---

## 3. Stateless Requests

APIs should remain stateless wherever possible.

Each request must contain:

- authentication
- workspace context
- required identifiers

---

## 4. Explicit Validation

All incoming requests must:

- be validated
- be sanitized
- reject invalid payloads

Validation is mandatory.

---

## 5. Secure By Default

Every API:

- requires authentication unless explicitly public
- enforces workspace boundaries
- validates permissions
- applies rate limiting

---

# Base URL Structure

## Standard API Prefix

```
/api/v1
```

---

## Examples

```
/api/v1/auth
/api/v1/workspaces
/api/v1/content-types
/api/v1/entries
/api/v1/assets
/api/v1/pages
/api/v1/products
```

---

# API Versioning Strategy

## Versioning Method

URI-based versioning:

```
/api/v1
```

---

## Rules

### Breaking Changes

Require:

- new API version

### Non-Breaking Changes

Allowed:

- optional fields
- additional metadata
- performance improvements

---

# Endpoint Naming Standards

## Resource Naming

Use:

- plural
- kebab-case

Examples:

```
content-types
workspace-members
product-variants
```

---

## Nested Resources

Example:

```
/api/v1/workspaces/:workspaceId/members
```

---

## Action Endpoints

Allowed only for explicit operations.

Examples:

```
/api/v1/entries/:id/publish
/api/v1/orders/:id/refund
```

---

# HTTP Method Standards

| Method | Purpose |
| --- | --- |
| GET | Read |
| POST | Create |
| PUT | Replace |
| PATCH | Partial update |
| DELETE | Remove |

---

# Request Standards

## Content Type

All APIs use:

```
application/json
```

unless explicitly handling:

- uploads
- streams
- exports

---

## Request Example

```
{
  "title":"Homepage",
  "status":"draft"
}
```

---

# Response Standards

## Success Response Format

```
{
  "success":true,
  "data": {}
}
```

---

## Collection Response Format

```
{
  "success":true,
  "data": [],
  "pagination": {
    "nextCursor":"abc123",
    "hasMore":true
  }
}
```

---

## Metadata Response Format

```
{
  "success":true,
  "data": {},
  "meta": {}
}
```

---

# Error Standards

## Standard Error Format

```
{
  "success":false,
  "error": {
    "code":"VALIDATION_ERROR",
    "message":"Title is required"
  }
}
```

---

# Error Object Rules

Every error must contain:

| Field | Required |
| --- | --- |
| code | YES |
| message | YES |

Optional:

- details
- validationErrors

---

## Validation Error Example

```
{
  "success":false,
  "error": {
    "code":"VALIDATION_ERROR",
    "message":"Validation failed",
    "validationErrors": {
      "title":"Required"
    }
  }
}
```

---

# HTTP Status Standards

| Status | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 204 | No content |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 429 | Rate limited |
| 500 | Internal error |

---

# Pagination Standards

## Cursor-Based Pagination

All large collections must use:

- cursor pagination

NOT offset pagination.

---

## Query Format

```
?limit=20&cursor=abc123
```

---

## Response Format

```
{
  "pagination": {
    "nextCursor":"abc123",
    "hasMore":true
  }
}
```

---

# Filtering Standards

## Query Filtering

Format:

```
?status=published&type=blog
```

---

## Multiple Filters

```
?status=published,draft
```

---

## Date Filters

```
?created_after=2026-01-01
```

---

# Sorting Standards

## Query Format

```
?sort=created_at:desc
```

---

## Multi-Field Sorting

```
?sort=status:asc,created_at:desc
```

---

# Authentication Standards

## Supported Authentication Types

| Type | Usage |
| --- | --- |
| Firebase ID Token | User auth |
| httpOnly Session Cookie | Dashboard sessions |
| API Key | External integrations |

---

## Authorization Header

```
Authorization: Bearer <token>
```

---

## API Key Header

```
x-api-key: <key>
```

---

# Workspace Context Rules

Every authenticated request must:

- resolve workspace context
- validate workspace access
- enforce RLS boundaries

---

# Validation Standards

## Validation Library

All validation uses:

- Zod

---

## Rules

Every request must validate:

- params
- body
- query
- headers where necessary

---

## Forbidden

Never trust:

- frontend validation
- client-generated IDs
- client permissions

---

# File Upload Standards

## Upload Flow

Uploads use:

- presigned URLs
- direct client uploads

Server should NOT proxy large uploads.

---

## Validation Rules

All uploads must validate:

- mime type
- extension
- size
- workspace ownership

---

# Rate Limiting Standards

## Default Limits

| API Type | Limit |
| --- | --- |
| Public API | 100 req/min |
| Authenticated API | 1000 req/min |
| Upload API | 50 req/min |

---

## Headers

```
x-ratelimit-limit
x-ratelimit-remaining
x-ratelimit-reset
```

---

# Idempotency Standards

## Required Operations

Idempotency required for:

- payments
- order creation
- publishing
- webhooks
- retries

---

## Header

```
Idempotency-Key: <uuid>
```

---

# Webhook Standards

## Event Naming

Format:

```
domain.action
```

Examples:

```
entry.published
order.created
asset.uploaded
```

---

## Webhook Payload Structure

```
{
  "event":"entry.published",
  "timestamp":"2026-01-01T00:00:00Z",
  "workspaceId":"workspace_123",
  "data": {}
}
```

---

## Webhook Security

All webhooks must:

- use HMAC signatures
- include timestamps
- support retries

---

## Retry Strategy

Retries:

- exponential backoff
- dead-letter queue after max retries

---

# API Documentation Standards

## Required Documentation

All public APIs require:

- endpoint description
- request examples
- response examples
- error examples
- authentication requirements

---

## Documentation Source

Primary source:

- OpenAPI specification

Generated docs:

- Scalar documentation UI

---

# Caching Standards

## Cacheable Endpoints

GET requests may use:

- CDN caching
- Redis caching
- edge caching

---

## Non-Cacheable Operations

Never cache:

- auth responses
- private user data
- mutation endpoints

---

# Logging Standards

## Required Log Fields

Every request log must include:

```
{
  "requestId":"",
  "workspaceId":"",
  "userId":"",
  "method":"",
  "path":"",
  "statusCode":200
}
```

---

# Security Standards

## Required Security Middleware

All APIs must use:

- helmet
- rate limiting
- request validation
- CORS protection

---

## Sensitive Data Rules

Never expose:

- passwords
- secrets
- internal tokens
- private credentials

---

# Future GraphQL Standards

GraphQL will be introduced later.

Future rules:

- query depth limiting
- query cost analysis
- DataLoader batching
- persisted queries
- API key scoping

---

# API Stability Rules

## Stable Contracts

Once public:

- fields should not disappear
- behavior should remain predictable

---

## Deprecation Policy

Deprecated APIs:

- must be documented
- must include migration guidance
- must remain available during transition period

---

# Final Principle

APIs are platform contracts.

The API layer must prioritize:

- consistency
- predictability
- security
- maintainability
- long-term stability

NOT:

- shortcut implementations
- inconsistent naming
- undocumented behavior
- hidden side effects