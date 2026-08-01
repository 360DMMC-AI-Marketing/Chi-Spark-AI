#!/usr/bin/env bash
#
# Chi-Spark AI — nightly backup
#
#   1. take a *consistent* snapshot of every database (this is the part restic
#      cannot do for you — see the SQLite note below)
#   2. hand that plus the application files to restic, which encrypts,
#      deduplicates, and uploads
#   3. prune old snapshots per the retention policy
#   4. verify repository integrity
#   5. destroy the staging copy, which is plaintext participant data
#
# Usage:  chispark-backup.sh [--deep-check]
# Config: /etc/chispark/backup.env   (see backup.env.example)

set -Eeuo pipefail

CONFIG="${CHISPARK_BACKUP_ENV:-/etc/chispark/backup.env}"
DEEP_CHECK=0
[[ "${1:-}" == "--deep-check" ]] && DEEP_CHECK=1

log()  { printf '%s  %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die()  { log "FAILED: $*" >&2; exit 1; }

# --------------------------------------------------------------------- config
[[ -r "$CONFIG" ]] || die "config not readable: $CONFIG"
set -a
# shellcheck source=/dev/null
source "$CONFIG"
set +a

: "${APP_DIR:?APP_DIR not set in $CONFIG}"
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY not set in $CONFIG}"
: "${RESTIC_PASSWORD_FILE:?RESTIC_PASSWORD_FILE not set in $CONFIG}"

KEEP_DAILY="${KEEP_DAILY:-14}"
KEEP_WEEKLY="${KEEP_WEEKLY:-8}"
KEEP_MONTHLY="${KEEP_MONTHLY:-12}"

[[ -d "$APP_DIR" ]]              || die "APP_DIR does not exist: $APP_DIR"
[[ -r "$RESTIC_PASSWORD_FILE" ]] || die "password file not readable: $RESTIC_PASSWORD_FILE"
command -v restic >/dev/null     || die "restic is not installed"

# EXTRA_PATHS covers things that live outside the app directory but would still
# hurt to lose — the nginx site config being the obvious one, since it is not in
# git either. Space-separated in the config file.
read -r -a extra_paths <<< "${EXTRA_PATHS:-}"
for p in ${extra_paths[@]+"${extra_paths[@]}"}; do
  [[ -e "$p" ]] || die "EXTRA_PATHS entry does not exist: $p"
done

# ------------------------------------------------------- single-run interlock
# A second run starting while the first is mid-upload would fight over the
# restic lock and leave the repo locked. flock makes the overlap impossible.
exec 9>/var/lock/chispark-backup.lock
flock -n 9 || die "another backup run is already in progress"

# ---------------------------------------------------------- staging + cleanup
# Staging holds an unencrypted copy of participant data for the duration of the
# run. Create it private, and register the cleanup trap *before* anything can
# fail, so a crash mid-run cannot leave plaintext behind.
# A fixed path, not mktemp: it becomes part of the snapshot's path list, and a
# stable path makes restores predictable instead of hunting for last night's
# random directory name. The flock above guarantees only one run owns it.
STAGING=/var/tmp/chispark-staging
rm -rf --one-file-system "$STAGING" 2>/dev/null || true
mkdir -p "$STAGING"
chmod 700 "$STAGING"
cleanup() {
  local rc=$?
  rm -rf --one-file-system "$STAGING" 2>/dev/null || true
  [[ $rc -ne 0 ]] && log "run aborted (exit $rc); staging removed"
  return $rc
}
trap cleanup EXIT

log "backup starting — app=$APP_DIR repo=$RESTIC_REPOSITORY"

# ------------------------------------------------------------------ databases
mkdir -p "$STAGING/db"
db_count=0

# --- SQLite ---
# Never `cp` a live SQLite file. A copy taken mid-transaction restores to a
# corrupt database, and you find out on the day you need it. `.backup` uses the
# online backup API and produces a consistent image of a database being written
# to. We then run integrity_check on the *copy* so a bad backup fails the run
# loudly tonight instead of silently in six months.
while IFS= read -r -d '' db; do
  name="$(basename "$db")"
  log "sqlite: snapshotting $name"

  # `.timeout` matters more than it looks. Under sustained write traffic the
  # online backup API can lose the race for the database lock and give up
  # immediately, failing the whole run. This was not theoretical — it happened
  # intermittently under load while testing this script. The timeout makes
  # sqlite wait for a quiet moment instead, and the retry covers the case where
  # 30s of writes never leaves one.
  attempt=1
  until sqlite3 -cmd ".timeout 30000" "$db" ".backup '$STAGING/db/$name'" 2>"$STAGING/.err"; do
    err="$(head -1 "$STAGING/.err" 2>/dev/null || echo 'unknown error')"
    [[ $attempt -ge 3 ]] && die "sqlite .backup failed for $db after 3 attempts: $err"
    log "sqlite: attempt $attempt failed ($err) — retrying in 15s"
    attempt=$((attempt + 1))
    sleep 15
  done

  integrity="$(sqlite3 "$STAGING/db/$name" 'PRAGMA integrity_check;' 2>&1 | head -1)"
  [[ "$integrity" == "ok" ]] \
    || die "restored-copy integrity check failed for $name: $integrity"
  log "sqlite: $name verified ok ($(du -h "$STAGING/db/$name" | cut -f1))"
  db_count=$((db_count + 1))
done < <(find "$APP_DIR" -maxdepth 3 -type f \
           -not -path '*/backups/*' -not -path '*/node_modules/*' \
           \( -name '*.db' -o -name '*.sqlite' -o -name '*.sqlite3' \) \
           ! -name '*-wal' ! -name '*-shm' -print0 2>/dev/null)

# --- Postgres ---
if [[ -n "${DATABASE_URL:-}" && "$DATABASE_URL" == postgres* ]]; then
  command -v pg_dump >/dev/null || die "DATABASE_URL is postgres but pg_dump is missing"
  log "postgres: dumping"
  pg_dump --no-owner --no-privileges --format=custom \
          --file="$STAGING/db/postgres.dump" "$DATABASE_URL" \
    || die "pg_dump failed"
  log "postgres: dumped ($(du -h "$STAGING/db/postgres.dump" | cut -f1))"
  db_count=$((db_count + 1))
fi

[[ $db_count -gt 0 ]] || log "WARNING: no databases found under $APP_DIR — backing up files only"

# --------------------------------------------------------------------- backup
# node_modules is large and reproducible from the lockfile. Everything else goes
# in, including .env — losing config is its own outage, and the restic repo is
# encrypted, so secrets are safe at rest there.
#
# The live database files are excluded deliberately. We already captured a
# consistent copy of each into staging above; letting restic also sweep up the
# raw file would store a second, possibly torn copy of the same database — the
# exact `cp`-a-live-database problem this script exists to avoid — and leave
# whoever is restoring at 3am to guess which of the two is trustworthy.
log "restic: uploading"
restic backup \
  --tag chispark --tag automated \
  --exclude "$APP_DIR/node_modules" \
  --exclude '**/node_modules' \
  --exclude '**/.git' \
  --exclude "$APP_DIR/**/*.db"      --exclude "$APP_DIR/*.db" \
  --exclude "$APP_DIR/**/*.sqlite"  --exclude "$APP_DIR/*.sqlite" \
  --exclude "$APP_DIR/**/*.sqlite3" --exclude "$APP_DIR/*.sqlite3" \
  --exclude '*.db-wal' --exclude '*.db-shm' \
  --exclude-caches \
  "$STAGING/db" "$APP_DIR" ${extra_paths[@]+"${extra_paths[@]}"} \
  || die "restic backup failed"

# ------------------------------------------------------------------ retention
log "restic: pruning (daily=$KEEP_DAILY weekly=$KEEP_WEEKLY monthly=$KEEP_MONTHLY)"
restic forget \
  --tag chispark \
  --keep-daily "$KEEP_DAILY" \
  --keep-weekly "$KEEP_WEEKLY" \
  --keep-monthly "$KEEP_MONTHLY" \
  --prune \
  || die "restic forget/prune failed"

# ---------------------------------------------------------------- verification
# Structural check every night is cheap. --deep-check additionally re-reads and
# re-hashes a slice of the actual data to catch bit rot at the storage layer;
# run it weekly from the separate timer, not nightly — it costs bandwidth.
if [[ $DEEP_CHECK -eq 1 ]]; then
  log "restic: integrity check (with 10% data re-read)"
  restic check --read-data-subset=10% || die "restic deep check failed"
else
  log "restic: integrity check (structural)"
  restic check || die "restic check failed"
fi

log "backup complete — $(restic snapshots --tag chispark --json | grep -o '"short_id"' | wc -l) snapshots retained"
