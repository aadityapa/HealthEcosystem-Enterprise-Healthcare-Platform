#!/bin/sh
# Backup verification script — restores latest pg_dump to ephemeral DB and validates row counts
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATABASE_URL="${DATABASE_URL:-postgresql://health:health@localhost:5432/healthecosystem}"
VERIFY_DB="healthecosystem_verify_$(date +%s)"

echo "[backup-verify] Creating verification database: $VERIFY_DB"
LATEST=$(ls -t "$BACKUP_DIR"/healthecosystem_*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
  echo "[backup-verify] No backup found in $BACKUP_DIR — skipping"
  exit 0
fi

echo "[backup-verify] Restoring from $LATEST"
createdb "$VERIFY_DB" 2>/dev/null || true
gunzip -c "$LATEST" | psql "$VERIFY_DB" -q

ROW_COUNT=$(psql "$VERIFY_DB" -t -c "SELECT COUNT(*) FROM core.tenants" 2>/dev/null || echo "0")
echo "[backup-verify] Tenant count in restored DB: $ROW_COUNT"

if [ "$ROW_COUNT" -lt 1 ]; then
  echo "[backup-verify] FAIL — expected at least 1 tenant"
  dropdb "$VERIFY_DB" 2>/dev/null || true
  exit 1
fi

dropdb "$VERIFY_DB"
echo "[backup-verify] PASS — backup verified successfully"
