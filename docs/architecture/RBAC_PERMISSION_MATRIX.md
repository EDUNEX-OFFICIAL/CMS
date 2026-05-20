# RBAC Permission Matrix

### Version 1.0

### Role-Based Access Control & Authorization Standards

---

# Purpose

This document defines the Role-Based Access Control (RBAC) model, permission hierarchy, authorization rules, resource ownership policies, and access governance standards for the CMS platform.

The objective is to:

- standardize authorization logic
- prevent permission chaos
- enforce tenant isolation
- support scalable access management
- reduce privilege escalation risks
- establish predictable permission boundaries

This document applies to:

- admin dashboard
- APIs
- CMS operations
- media systems
- builder systems
- commerce systems
- billing systems
- integrations

---

# Authorization Philosophy

The platform uses:

- Role-Based Access Control (RBAC)
- workspace-scoped permissions
- least-privilege access

Authorization must always be:

- explicit
- validated server-side
- workspace-aware

Frontend permissions are NOT trusted as security boundaries.

---

# Core Security Principles

## 1. Least Privilege

Users should only receive:

- minimum required access
- minimum required permissions

---

## 2. Workspace Isolation

Permissions exist within:

- workspace boundaries

A user in one workspace must never gain:

- visibility
- actions
- access

to another workspace unless explicitly authorized.

---

## 3. Backend Authorization Is Mandatory

Every protected operation must validate:

- authentication
- workspace membership
- role permissions
- ownership constraints

---

## 4. Explicit Permissions

No hidden admin access.
No implicit privilege escalation.

---

# RBAC Model Overview

## Access Hierarchy

```
Workspace
  └── Role
        └── Permissions
```

---

# Core Roles

| Role | Purpose |
| --- | --- |
| Owner | Full workspace control |
| Admin | Operational management |
| Editor | Content editing |
| Viewer | Read-only access |

---

# Future Roles

Deferred until later phases:

- Billing Manager
- Commerce Manager
- SEO Manager
- Support Agent
- Developer
- API Integrator

---

# Workspace Ownership Rules

## Workspace Owner

The workspace owner:

- has full access
- cannot be removed by non-owners
- controls billing ownership

---

# Ownership Restrictions

Only Owners may:

- delete workspaces
- transfer ownership
- manage billing plans
- manage API root access

---

# Permission Categories

| Category | Purpose |
| --- | --- |
| Workspace | Tenant management |
| CMS | Content management |
| Builder | Page & layout management |
| Media | Asset management |
| Commerce | Products & orders |
| SEO | Metadata & redirects |
| Analytics | Reporting |
| Billing | Subscription management |
| Platform | API keys & integrations |

---

# Permission Naming Standard

## Format

```
domain.resource.action
```

---

# Examples

```
cms.entries.create
cms.entries.publish
media.assets.upload
commerce.orders.refund
workspace.members.invite
```

---

# Forbidden Naming

Avoid:

```
canEditStuff
manageThings
adminAccess
```

---

# Workspace Permissions

## Permission Matrix

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| View workspace | YES | YES | YES | YES |
| Update workspace settings | YES | YES | NO | NO |
| Delete workspace | YES | NO | NO | NO |
| Invite members | YES | YES | NO | NO |
| Remove members | YES | YES | NO | NO |
| Assign roles | YES | YES | NO | NO |
| Transfer ownership | YES | NO | NO | NO |

---

# CMS Permissions

## Content Types

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Create content types | YES | YES | NO | NO |
| Update content types | YES | YES | NO | NO |
| Delete content types | YES | YES | NO | NO |
| View content types | YES | YES | YES | YES |

---

## Entries

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Create entries | YES | YES | YES | NO |
| Edit entries | YES | YES | YES | NO |
| Delete entries | YES | YES | YES | NO |
| Publish entries | YES | YES | YES | NO |
| View entries | YES | YES | YES | YES |

---

# Builder Permissions

## Pages & Layouts

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Create pages | YES | YES | YES | NO |
| Edit pages | YES | YES | YES | NO |
| Delete pages | YES | YES | YES | NO |
| Publish pages | YES | YES | YES | NO |
| Manage themes | YES | YES | NO | NO |

---

# Media Permissions

## Assets

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Upload assets | YES | YES | YES | NO |
| Delete assets | YES | YES | YES | NO |
| View assets | YES | YES | YES | YES |
| Organize folders | YES | YES | YES | NO |

---

# Commerce Permissions

## Products

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Create products | YES | YES | YES | NO |
| Edit products | YES | YES | YES | NO |
| Delete products | YES | YES | NO | NO |
| Publish products | YES | YES | YES | NO |

---

## Orders

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| View orders | YES | YES | NO | NO |
| Refund orders | YES | YES | NO | NO |
| Export orders | YES | YES | NO | NO |

---

# SEO Permissions

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Edit SEO metadata | YES | YES | YES | NO |
| Manage redirects | YES | YES | NO | NO |
| Generate sitemap | YES | YES | NO | NO |

---

# Analytics Permissions

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| View analytics | YES | YES | YES | YES |
| Export analytics | YES | YES | NO | NO |

---

# Billing Permissions

## Billing Access

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| View billing | YES | YES | NO | NO |
| Update subscription | YES | NO | NO | NO |
| View invoices | YES | YES | NO | NO |
| Cancel subscription | YES | NO | NO | NO |

---

# Platform Permissions

## API Keys & Integrations

| Permission | Owner | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Create API keys | YES | YES | NO | NO |
| Revoke API keys | YES | YES | NO | NO |
| Manage webhooks | YES | YES | NO | NO |

---

# API Authorization Rules

## Backend Validation Mandatory

Every protected endpoint must validate:

- user identity
- workspace membership
- permission existence

---

# Forbidden Practices

Never:

- trust frontend role checks
- expose admin-only routes publicly
- bypass authorization middleware

---

# Resource Ownership Rules

## Ownership Enforcement

Some resources require:

- ownership validation
in addition to role validation.

---

# Example

A user may:

- edit their own draft

but not:

- publish another workspace's content

without required permissions.

---

# Permission Resolution Order

## Authorization Flow

```
Authentication
  → Workspace Validation
    → Role Resolution
      → Permission Validation
        → Resource Ownership Validation
```

---

# Permission Storage Standards

## Recommended Schema

```
roles
permissions
role_permissions
workspace_members
```

---

# Future Custom Roles

Custom roles are deferred until:

- SaaS scaling phase
- enterprise requirements
- advanced workspace management

---

# API Key Permissions

## Scoped Permissions

API keys must support:

- scoped permissions
- workspace isolation
- expiration
- revocation

---

# Example API Scopes

```
cms.read
cms.write
media.upload
commerce.orders.read
```

---

# Temporary Access Rules

Temporary elevated access should:

- expire automatically
- remain auditable
- require explicit assignment

---

# Audit Logging Standards

Critical permission changes must log:

- actor
- target user
- workspace
- permission changes
- timestamps

---

# Example Audit Event

```json
{
  "event": "workspace.role.updated",
  "workspaceId": "workspace_123",
  "actorId": "user_123",
  "targetUserId": "user_456",
  "role": "admin"
}
```

---

# Security Restrictions

## Forbidden Permission Patterns

Never:

- expose wildcard admin access
- bypass workspace validation
- hardcode admin users
- rely only on frontend restrictions

---

# Future RBAC Expansion

Future enhancements may include:

- custom roles
- permission groups
- field-level permissions
- content approval workflows
- environment-based access
- enterprise permission policies

These are intentionally deferred until:

- operational maturity
- SaaS scaling
- enterprise demand

---

# Final Principle

Authorization must prioritize:

- tenant isolation
- explicit access control
- predictable permission behavior
- operational security
- auditability

NOT:

- convenience shortcuts
- hidden privilege escalation
- implicit admin access
- frontend-only protection