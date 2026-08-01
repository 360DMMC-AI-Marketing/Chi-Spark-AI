# Phase 0 — securing what already exists

Runbook for the founding team. Work top to bottom; each step is independent and
safe to stop after.

**Status as of 1 Aug 2026**

| Item | State |
| --- | --- |
| HTTPS on `chisparkai.org`, HTTP→HTTPS redirect | Done |
| `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` | Done |
| API rejects unauthenticated requests (401) | Done |
| Backend source under version control | **Not done — highest risk** |
| HSTS, CSP, `Permissions-Policy` | Not done — step 2 |
| Automated off-box backups | Unverified — step 3 |
| Bare-IP HTTP bypass closed | Unverified — step 4 |
| Managed auth (Clerk / Auth0) | Later, after the backend is reviewable |

---

## 1. Get the backend into git — do this first

Everything that serves `/api/*` — login, TOTP verification, session handling,
recovery codes, the audit log, the leads store, and the database schema — exists
**only on the VPS**. It is in no repository, on no other disk, and in no
backup we can see.

Concretely, if that disk fails tonight, all of it is gone. Not "restore from a
snapshot" — gone. Every other item on this list depends on the code being
reviewable, so this comes first.

### 1a. Look at what's there (read-only, changes nothing)

```bash
# where nginx sends /api
grep -rn "proxy_pass\|location /api" /etc/nginx/sites-enabled/ 2>/dev/null

# what is listening, and what runs it
ss -tlnp | grep -v ':80 \|:443 '
systemctl list-units --type=service --state=running | grep -iE 'node|chispark|portal|api'

# find the app directory (adjust if it lives elsewhere)
ls -la /opt /srv /var/www 2>/dev/null
```

Send that output over and we'll pin down exactly what to commit.

### 1b. Commit it — without committing secrets

This is the step where projects leak credentials, so do it deliberately.

Before `git add`, write the ignore file **first**:

```bash
cd <the backend directory>

cat > .gitignore <<'EOF'
node_modules/
.env
.env.*
*.db
*.sqlite
*.sqlite3
*.db-wal
*.db-shm
*.pem
*.key
backups/
EOF
```

Then inspect what would actually be committed, and read it:

```bash
git init 2>/dev/null
git add -A
git status --short          # every file that would go in
git diff --cached | grep -inE 'secret|password|token|api[_-]?key|BEGIN .*PRIVATE'
```

That last command is the important one. It greps the staged content for
credentials. **Expect hits** — session signing keys, TOTP encryption keys, and
any SMTP or database password are probably sitting in a config file rather than
an env var. If anything turns up:

1. `git rm --cached <file>` to unstage it
2. Move the value into `.env` (already ignored)
3. Commit a `.env.example` with the *keys* and empty values, so the shape of the
   config is documented without the secrets
4. Re-run the grep until it is clean

A secret committed once stays in git history forever, even if you delete it in a
later commit — so it is much cheaper to catch it now than to rewrite history
later.

Once clean, push it. Either into this repo under `server/`, or as its own
private repo — either is fine, version control is the point.

> **Rotate anything that was already exposed.** If a signing key or password has
> been sitting in a file on a shared box, treat it as known and generate a new
> one. Changing the session signing key logs everyone out, which is the expected
> and correct cost.

---

## 2. Apply the security headers

`nginx/security-headers.conf` in this directory adds HSTS, a Content Security
Policy, and `Permissions-Policy` to what you already have. Read the comments in
it before applying — particularly the two staged rollouts (HSTS `max-age`, and
CSP starting in Report-Only).

```bash
sudo cp deploy/nginx/security-headers.conf \
        /etc/nginx/snippets/chispark-security-headers.conf
```

Then inside the `server { listen 443 ssl; ... }` block for `chisparkai.org`:

```nginx
include /etc/nginx/snippets/chispark-security-headers.conf;
```

If that block already sets `X-Frame-Options`, `X-Content-Type-Options`, or
`Referrer-Policy`, delete those lines — the snippet sets them. nginx's
`add_header` does not merge across levels, and duplicates are confusing rather
than harmful.

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sI https://chisparkai.org | grep -i 'strict-transport\|content-security\|permissions'
```

Then open the portal and **walk through 2FA setup and a recovery-code download**
with the browser console open. The CSP ships in Report-Only precisely so a
mistake here shows up as a console warning instead of a broken login. When it is
silent, switch to the enforcing header and raise HSTS to a year.

---

## 3. Backups

Nothing here is safe to automate until step 1 tells us what the database
actually is. One thing worth knowing in advance: **if it is SQLite, do not back
it up with `cp`.** Copying a live SQLite file mid-write produces a backup that
restores to a corrupt database, and you generally find out on the day you need
it. Use `sqlite3 <db> ".backup <dest>"` or `VACUUM INTO`, both of which take a
consistent snapshot.

The target: nightly, encrypted, written somewhere that is not this VPS, and a
restore actually performed once to prove the backup works. A backup that has
never been restored is a hypothesis.

---

## 4. Close the bare-IP bypass

`chisparkai.org` is properly on HTTPS, but the earlier deployment also answered
on `http://2.25.167.45:8888` in cleartext. If that listener is still up it is a
plaintext route to the same portal, and the HTTPS work does not protect anyone
who reaches it that way.

```bash
ss -tlnp | grep 8888          # anything still listening?
sudo ufw status | grep 8888   # still allowed through the firewall?
```

If the site is fully served through the domain now, remove the port-8888 server
block and close the firewall rule:

```bash
sudo rm /etc/nginx/sites-enabled/chi-spark-ai   # the :8888 block
sudo nginx -t && sudo systemctl reload nginx
sudo ufw delete allow 8888/tcp
```

---

## 5. Managed authentication

Deferred deliberately. Moving off the hand-rolled TOTP and session handling to
Clerk or Auth0 is the right call before student data lands, but it means
rewriting the auth layer — and there is no sense doing that to code that is not
yet in version control and cannot be reviewed. Step 1 unblocks it.
