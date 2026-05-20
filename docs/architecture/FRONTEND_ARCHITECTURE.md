# Frontend Architecture
### Version 1.0
### Next.js App Router & UI System Standards

---

# Purpose

This document defines frontend architecture standards, rendering strategies, component ownership rules, state management conventions, builder rendering architecture, and UI system governance for the CMS platform.

The objective is to:
- standardize frontend structure
- prevent UI architecture drift
- improve maintainability
- support scalable component systems
- optimize rendering performance
- establish predictable frontend patterns

This document applies to:
- admin dashboard
- builder UI
- storefront rendering
- shared UI packages
- future frontend applications

---

# Frontend Philosophy

The frontend architecture prioritizes:
- modularity
- server-first rendering
- predictable state management
- reusable UI systems
- scalable component composition

The frontend is NOT intended to become:
- a giant client-side SPA
- an uncontrolled component library
- a tightly coupled backend renderer

---

# Core Frontend Principles

## 1. Server-First Architecture

Prefer:
- Server Components
- server data fetching
- SSR/streaming
- minimal client JavaScript

Avoid unnecessary client-side rendering.

---

## 2. Component Reusability

UI components must:
- remain composable
- remain isolated
- avoid business logic coupling

---

## 3. Predictable State Management

Prefer:
- local state
- server state
- React Query

Avoid:
- massive global stores
- unnecessary client synchronization

---

## 4. Clear Rendering Boundaries

Rendering responsibilities must remain separated:
- CMS data
- builder rendering
- commerce rendering
- layout rendering

No mixed rendering ownership.

---

# Core Frontend Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Primitives | Radix UI |
| Animation | Framer Motion |
| Data Fetching | React Query |
| Forms | React Hook Form + Zod |
| Rich Text | Tiptap |

---

# Frontend Applications

## Application Structure

```txt
/apps
  /web
  /storefront
```

---

# Application Responsibilities

| App | Responsibility |
|---|---|
| web | Admin dashboard & CMS |
| storefront | Public website rendering |

---

# Shared Package Structure

```txt
/packages
  /ui
  /shared
  /config
```

---

# Shared UI System

## Shared Components

Reusable UI components must live in:

```txt
/packages/ui
```

---

# Allowed Shared Components

Examples:
- buttons
- dialogs
- dropdowns
- cards
- inputs
- modals
- typography

---

# Forbidden Shared Logic

Shared UI components must NOT contain:
- API calls
- business logic
- CMS mutations
- domain workflows

---

# Frontend Folder Structure

## Recommended Structure

```txt
/src
  /app
  /components
  /features
  /hooks
  /lib
  /providers
  /services
  /types
```

---

# Feature-Based Architecture

Business functionality must organize by feature/domain.

Example:

```txt
/features
  /auth
  /cms
  /builder
  /media
  /commerce
```

---

# App Router Standards

## Required Routing

Use:
- Next.js App Router

---

# Route Organization

```txt
/app
  /(dashboard)
  /(auth)
  /(storefront)
```

---

# Layout Standards

Every major route group should define:
- layout.tsx
- loading.tsx
- error.tsx

---

# Server Component Standards

## Default Rule

All components should default to:
- Server Components

---

# Client Component Usage

Use `"use client"` ONLY when necessary.

Examples:
- local interactivity
- drag-and-drop
- form state
- animations
- browser APIs

---

# Forbidden Practices

Avoid:
- client-rendering entire pages unnecessarily
- global client wrappers everywhere

---

# Data Fetching Standards

## Preferred Strategy

Prefer:
- server-side fetching
- route handlers
- React Query for client state

---

# React Query Usage

Use React Query for:
- mutations
- optimistic updates
- client caching
- background refresh

---

# Forbidden Practices

Avoid:
- duplicate fetching layers
- uncontrolled fetch calls in components

---

# State Management Standards

## Preferred State Hierarchy

| State Type | Solution |
|---|---|
| Local UI state | useState |
| Server state | React Query |
| Shared lightweight state | Context |
| Builder/editor state | Dedicated store |

---

# Global State Rules

Global state allowed ONLY for:
- auth session
- theme state
- builder editor state

---

# Forbidden Practices

Avoid:
- giant global stores
- unnecessary Redux complexity

---

# Form Standards

## Official Form Stack

Use:
- React Hook Form
- Zod validation

---

# Validation Rules

Validation must exist:
- client-side
- server-side

---

# Builder Architecture

## Builder Philosophy

The builder is:
- JSON-driven
- schema-controlled
- renderer-based

---

# Builder Rendering Flow

```txt
JSON Blocks → Renderer → React Components
```

---

# Block Structure

```json
{
  "id": "block_1",
  "type": "hero",
  "props": {},
  "styles": {},
  "children": []
}
```

---

# Block Rendering Standards

Each block must:
- remain isolated
- support serialization
- support responsive rendering

---

# Builder Component Rules

Blocks must NOT:
- directly fetch business data
- mutate CMS state internally
- contain hidden side effects

---

# Theming Standards

## Theme System

Themes use:
- CSS variables
- design tokens

---

# Token Categories

```txt
colors
spacing
typography
radius
shadows
```

---

# Theme Storage

Themes stored as:
```txt
JSON configuration
```

---

# Responsive Standards

## Required Breakpoints

| Breakpoint | Usage |
|---|---|
| mobile | default |
| tablet | md |
| desktop | lg/xl |

---

# Mobile Philosophy

Mobile-first responsive design is mandatory.

---

# Animation Standards

## Official Animation Library

Use:
```txt
Framer Motion
```

---

# Animation Rules

Animations should:
- remain subtle
- improve UX
- avoid layout instability

---

# Forbidden Animation Practices

Avoid:
- excessive motion
- heavy animation loops
- blocking transitions

---

# API Integration Standards

## API Layer

API calls should exist in:
```txt
/services
```

---

# Forbidden Practices

Do NOT:
- scatter fetch logic across UI components
- directly call APIs from deeply nested components

---

# Authentication Frontend Rules

## Session Handling

Frontend must:
- treat backend as source of truth
- validate session server-side

---

# Forbidden Practices

Never:
- trust frontend role checks alone
- expose sensitive auth state publicly

---

# Error Handling Standards

## Required Error Layers

Every major route should support:
- loading states
- empty states
- error states

---

# Error Boundary Rules

Critical UI sections should use:
- React error boundaries

---

# Accessibility Standards

## Required Accessibility

UI components must support:
- keyboard navigation
- focus management
- aria labels

---

# SEO Standards

## Rendering Strategy

SEO-critical pages should use:
- SSR
- metadata API
- structured data injection

---

# Performance Standards

## Performance Priorities

Optimize:
- bundle size
- hydration cost
- image loading
- render waterfalls

---

# Forbidden Practices

Avoid:
- large client bundles
- unnecessary hydration
- oversized dependencies

---

# Image Standards

## Official Image Component

Use:
```txt
next/image
```

---

# Image Rules

Images must:
- lazy load
- optimize sizes
- use responsive formats

---

# Frontend Security Standards

## Security Rules

Frontend must:
- sanitize HTML
- avoid unsafe rendering
- protect against XSS

---

# Forbidden Practices

Never use:
```txt
dangerouslySetInnerHTML
```

unless explicitly sanitized.

---

# Testing Standards

## Frontend Testing

Critical flows should test:
- rendering
- forms
- permissions
- builder interactions

---

# Documentation Standards

Major frontend systems require:
- architecture notes
- usage documentation
- component contracts

---

# Future Expansion Strategy

The frontend architecture should support future:
- white-labeling
- multi-brand themes
- plugin rendering
- marketplace systems
- advanced builder capabilities

WITHOUT requiring:
- frontend rewrites
- rendering redesigns
- architecture restructuring

---

# Final Principle

The frontend architecture must prioritize:
- maintainability
- rendering performance
- modularity
- predictable state flow
- scalable UI systems

NOT:
- excessive abstraction
- uncontrolled component growth
- client-heavy rendering
- frontend architectural chaos