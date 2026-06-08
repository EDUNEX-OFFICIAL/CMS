#!/bin/bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.server.yml}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-cms}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/cms}"
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_ROOT}/cms_${STAMP}.dump"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

mkdir -p "$BACKUP_ROOT"

export COMPOSE_PROJECT_NAME
COMPOSE=(docker compose --env-file .env.production -f "$COMPOSE_FILE")

if ! "${COMPOSE[@]}" ps postgres 2>/dev/null | grep -Eq "Up|running"; then
  echo "CMS postgres container is not running."
  exit 1
fi

echo "Backing up CMS database to ${BACKUP_FILE}..."
"${COMPOSE[@]}" exec -T postgres pg_dump -U postgres -Fc cms > "$BACKUP_FILE"
echo "Backup complete: ${BACKUP_FILE}"

find "$BACKUP_ROOT" -name 'cms_*.dump' -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true
echo "Pruned backups older than ${RETENTION_DAYS} days."
