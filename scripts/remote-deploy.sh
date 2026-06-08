#!/bin/bash
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/CMS}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.server.yml}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-cms}"

cd "$APP_DIR"

if [ ! -f .env.production ]; then
  if [ -f .env.production.example ]; then
    cp .env.production.example .env.production
    echo "::warning::Created .env.production from example — update secrets before going live"
  else
    echo "::error::Missing $APP_DIR/.env.production — copy from .env.production.example"
    exit 1
  fi
fi

export COMPOSE_PROJECT_NAME
COMPOSE=(docker compose --env-file .env.production -f "$COMPOSE_FILE")

echo "Building CMS images..."
"${COMPOSE[@]}" build cms-api cms-web cms-storefront

echo "Starting infrastructure..."
"${COMPOSE[@]}" up -d postgres redis minio

echo "Waiting for PostgreSQL..."
for _ in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T postgres pg_isready -U postgres -d cms >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "Running database migrations..."
"${COMPOSE[@]}" run --rm --no-deps cms-api \
  sh -c "cd /app && pnpm --filter @repo/db migrate"

echo "Starting application services (API bootstraps MinIO bucket on startup)..."
"${COMPOSE[@]}" up -d --remove-orphans

echo "Waiting for API health..."
for _ in $(seq 1 40); do
  if curl -fsS http://127.0.0.1:8082/api/v1/health >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

curl -fsS http://127.0.0.1:8082/api/v1/health
echo ""

echo "Restarting CMS gateway to refresh upstream DNS..."
"${COMPOSE[@]}" restart cms-gateway

"${COMPOSE[@]}" ps
