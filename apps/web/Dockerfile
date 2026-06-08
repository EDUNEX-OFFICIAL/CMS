# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/storefront/package.json apps/storefront/
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_FIREBASE_API_KEY=
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID

RUN pnpm --filter web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S cms && adduser -S cms -G cms

COPY --from=builder --chown=cms:cms /app/apps/web/.next/standalone ./
COPY --from=builder --chown=cms:cms /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=cms:cms /app/apps/web/public ./apps/web/public

USER cms
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
