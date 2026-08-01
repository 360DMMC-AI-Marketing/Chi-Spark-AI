#!/usr/bin/env bash
#
# Chi-Spark AI — Phase 0 apply: security headers + backup pipeline
#
# Run this from a checkout of the repo, on the production VPS, as root:
#
#   git clone --depth 1 https://github.com/360dmmc-ai-marketing/chi-spark-ai /tmp/chispark-deploy
#   cd /tmp/chispark-deploy
#   sudo bash deploy/scripts/phase0-apply.sh
#
# Safe to re-run. Every step checks its own precondition before touching
# anything, and the nginx edit tests before it reloads — a bad edit rolls
# itself back instead of taking the site down.
#
# What this does NOT do, on purpose:
#   - It will not switch CSP from Report-Only to enforcing, or HSTS to a year.
#     Ship the staged versions first, watch the console during a real 2FA
#     enrollment, then flip those by hand — see deploy/README.md step 2.
#   - It will not create your off-box storage bucket or fill in its
#     credentials. Nobody but you can do that part; the script stops and
#     tells you exactly what to fill in.
#   - It does not touch :8888. That listener is on the OLD VPS (2.25.167.45),
#     a completely different machine from the one this script runs on —
#     see deploy/README.md step 4 for that one, run there separately.

set -Eeuo pipefail

SITE_FILE="/etc/nginx/sites-enabled/chisparkai.org"
SNIPPET_SRC="deploy/nginx/security-headers.conf"
SNIPPET_DST="/etc/nginx/snippets/chispark-security-headers.conf"
APP_DIR="/opt/chispark-api"

log()  { printf '\n== %s ==\n' "$*"; }
die()  { printf 'FAILED: %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "run as root (sudo bash deploy/scripts/phase0-apply.sh)"
[[ -f "$SNIPPET_SRC" ]] || die "run this from the repo root — $SNIPPET_SRC not found"

# =====================================================================
# Phase A — security headers
# =====================================================================
log "Phase A: security headers"

if [[ ! -f "$SITE_FILE" ]]; then
  echo "  $SITE_FILE not found — skipping, apply the include manually (see deploy/README.md step 2)"
else
  install -m 644 "$SNIPPET_SRC" "$SNIPPET_DST"
  echo "  snippet installed -> $SNIPPET_DST"

  if grep -q "chispark-security-headers.conf" "$SITE_FILE"; then
    echo "  already included in $SITE_FILE — nothing to change"
  else
    BACKUP="${SITE_FILE}.bak-phase0-$(date -u +%Y%m%d-%H%M%S)"
    cp -p "$SITE_FILE" "$BACKUP"
    echo "  backed up current config -> $BACKUP"

    # The snippet sets X-Frame-Options / X-Content-Type-Options / Referrer-Policy
    # itself — drop the duplicates already in the site file so there's exactly
    # one add_header per directive (duplicates aren't harmful, just confusing).
    sed -i \
      -e '/add_header X-Frame-Options/d' \
      -e '/add_header X-Content-Type-Options/d' \
      -e '/add_header Referrer-Policy/d' \
      "$SITE_FILE"

    # Anchor on the `root` directive — it appears exactly once, inside the
    # HTTPS server block (the plain-HTTP block is just a redirect with no root).
    if ! grep -q '^\s*root ' "$SITE_FILE"; then
      cp -p "$BACKUP" "$SITE_FILE"
      die "couldn't find a 'root' line to anchor the include on — restored backup, edit $SITE_FILE by hand"
    fi
    sed -i "/^\s*root /a\\    include ${SNIPPET_DST};" "$SITE_FILE"

    if nginx -t 2>/tmp/phase0-nginx-test.log; then
      systemctl reload nginx
      echo "  include added, nginx -t passed, reloaded"
    else
      cp -p "$BACKUP" "$SITE_FILE"
      cat /tmp/phase0-nginx-test.log >&2
      die "nginx -t failed — restored $SITE_FILE from backup, nginx was NOT reloaded"
    fi
  fi

  echo "  verifying headers on the live site:"
  curl -sI https://chisparkai.org | grep -i 'strict-transport\|content-security\|permissions' || true
fi

echo "  REMAINING MANUAL STEP: open the portal, walk through 2FA setup + a"
echo "  recovery-code download with the browser console open. Once it's silent,"
echo "  edit $SNIPPET_DST to switch CSP to enforcing and HSTS to a year,"
echo "  then: nginx -t && systemctl reload nginx"

# =====================================================================
# Phase B — backups
# =====================================================================
log "Phase B: backup pipeline"

command -v restic >/dev/null || apt-get install -y restic
command -v sqlite3 >/dev/null || apt-get install -y sqlite3

install -m 755 deploy/scripts/chispark-backup.sh  /usr/local/bin/
install -m 755 deploy/scripts/chispark-restore.sh /usr/local/bin/
echo "  scripts installed -> /usr/local/bin/"

mkdir -p /etc/chispark
if [[ ! -f /etc/chispark/backup.env ]]; then
  install -m 600 deploy/scripts/backup.env.example /etc/chispark/backup.env
  sed -i "s|^APP_DIR=.*|APP_DIR=${APP_DIR}|" /etc/chispark/backup.env
  echo "  /etc/chispark/backup.env created from template, APP_DIR set to ${APP_DIR}"
else
  echo "  /etc/chispark/backup.env already exists — leaving it alone"
fi

if [[ ! -f /etc/chispark/restic-password ]]; then
  openssl rand -base64 48 > /etc/chispark/restic-password
  chmod 600 /etc/chispark/restic-password
  echo "  generated /etc/chispark/restic-password"
  echo ""
  echo "  ##########################################################"
  echo "  #  COPY THIS SOMEWHERE OTHER THAN THIS SERVER RIGHT NOW:  #"
  echo "  ##########################################################"
  cat /etc/chispark/restic-password
  echo "  restic encrypts client-side — lose this and every backup becomes"
  echo "  permanently unreadable. Password manager + paper, before anything else."
  echo ""
fi

if grep -q '<ACCOUNT_ID>' /etc/chispark/backup.env 2>/dev/null || grep -qE '^AWS_ACCESS_KEY_ID=\s*$' /etc/chispark/backup.env 2>/dev/null; then
  echo "  STOPPING HERE — /etc/chispark/backup.env still has placeholder storage credentials."
  echo "  Fill in RESTIC_REPOSITORY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (Cloudflare R2"
  echo "  or Backblaze B2 — see deploy/README.md section 3), then re-run this script to"
  echo "  finish: it will pick up from here and run restic init + the first backup."
  exit 0
fi

set -a
# shellcheck source=/dev/null
source /etc/chispark/backup.env
set +a

if ! restic snapshots >/dev/null 2>&1; then
  log "restic repository not yet initialized — running restic init"
  restic init
fi

log "running first backup by hand"
/usr/local/bin/chispark-backup.sh

log "verifying it actually restores"
/usr/local/bin/chispark-restore.sh --verify

log "installing timers"
cp deploy/systemd/chispark-backup*.{service,timer} /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now chispark-backup.timer chispark-backup-verify.timer
systemctl list-timers 'chispark*'

log "Phase 0 apply complete"
echo "Still outstanding (different machine): check/close the :8888 bypass on"
echo "the OLD VPS (2.25.167.45) — see deploy/README.md step 4."
