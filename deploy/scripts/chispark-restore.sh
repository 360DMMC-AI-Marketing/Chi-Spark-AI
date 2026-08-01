#!/usr/bin/env bash
#
# Chi-Spark AI — restore / restore-test
#
# Restores a snapshot to a directory and verifies every database in it.
# It deliberately does NOT touch the live application. Swapping a restored
# database into production is a decision a human makes, with the service
# stopped — not something a script does while the app is mid-write.
#
#   chispark-restore.sh --list                  # what snapshots exist
#   chispark-restore.sh --verify                # restore latest to temp, check, discard
#   chispark-restore.sh --to /var/tmp/restore   # restore latest, keep it
#   chispark-restore.sh --to DIR --snapshot ID  # restore a specific snapshot
#
# --verify is the one that matters. Run it monthly. An untested backup is a
# hypothesis, and the failure mode of an untested backup is discovering on your
# worst day that it never worked.

set -Eeuo pipefail

CONFIG="${CHISPARK_BACKUP_ENV:-/etc/chispark/backup.env}"
SNAPSHOT="latest"
TARGET=""
MODE=""

log() { printf '%s  %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die() { log "FAILED: $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --list)     MODE=list; shift ;;
    --verify)   MODE=verify; shift ;;
    --to)       MODE=restore; TARGET="${2:?--to needs a directory}"; shift 2 ;;
    --snapshot) SNAPSHOT="${2:?--snapshot needs an id}"; shift 2 ;;
    *) die "unknown argument: $1" ;;
  esac
done
[[ -n "$MODE" ]] || die "need one of --list, --verify, or --to DIR"

[[ -r "$CONFIG" ]] || die "config not readable: $CONFIG"
set -a
# shellcheck source=/dev/null
source "$CONFIG"
set +a
: "${RESTIC_REPOSITORY:?not set}"
: "${RESTIC_PASSWORD_FILE:?not set}"

if [[ "$MODE" == list ]]; then
  restic snapshots --tag chispark
  exit 0
fi

# ------------------------------------------------------------------- restore
if [[ "$MODE" == verify ]]; then
  TARGET="$(mktemp -d /var/tmp/chispark-verify.XXXXXXXX)"
  chmod 700 "$TARGET"
  # Restored data is plaintext participant data. Remove it whatever happens.
  trap 'rm -rf --one-file-system "$TARGET" 2>/dev/null || true' EXIT
else
  mkdir -p "$TARGET"
  chmod 700 "$TARGET"
fi

log "restoring snapshot '$SNAPSHOT' to $TARGET"
restic restore "$SNAPSHOT" --target "$TARGET" || die "restic restore failed"

# ------------------------------------------------------------------- verify
fail=0
found=0

while IFS= read -r -d '' db; do
  found=$((found + 1))
  result="$(sqlite3 "$db" 'PRAGMA integrity_check;' 2>&1 | head -1)"
  if [[ "$result" == "ok" ]]; then
    tables="$(sqlite3 "$db" "SELECT count(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo '?')"
    log "OK    $(basename "$db") — integrity ok, $tables tables, $(du -h "$db" | cut -f1)"
  else
    log "BAD   $(basename "$db") — $result"
    fail=1
  fi
done < <(find "$TARGET" -type f \( -name '*.db' -o -name '*.sqlite' -o -name '*.sqlite3' \) -print0 2>/dev/null)

while IFS= read -r -d '' dump; do
  found=$((found + 1))
  if pg_restore --list "$dump" >/dev/null 2>&1; then
    log "OK    $(basename "$dump") — dump readable, $(du -h "$dump" | cut -f1)"
  else
    log "BAD   $(basename "$dump") — pg_restore cannot read this dump"
    fail=1
  fi
done < <(find "$TARGET" -type f -name '*.dump' -print0 2>/dev/null)

[[ $found -gt 0 ]] || { log "WARNING: no databases found in the restored snapshot"; fail=1; }

if [[ $fail -eq 0 ]]; then
  log "RESTORE TEST PASSED — $found database(s) verified"
  [[ "$MODE" == restore ]] && log "restored files are in $TARGET (live app untouched)"
  exit 0
else
  die "restore test FAILED — the backups are not currently trustworthy"
fi
