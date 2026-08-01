// Chi-Spark AI — self-hosted leads API + team portal auth (hardened)
// Zero npm dependencies: node:http + node:sqlite + node:crypto (requires Node >= 22.5)
import http from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import crypto from 'node:crypto'
import fs from 'node:fs'

// --- config ---------------------------------------------------------------
const env = Object.fromEntries(
  fs.readFileSync(new URL('./.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const PORT = parseInt(env.PORT || '8787', 10)
const ADMIN_TOKEN = env.ADMIN_TOKEN || ''
const SESSION_DAYS = 14
const MIN_PASSWORD = 12

// --- database -------------------------------------------------------------
const db = new DatabaseSync(new URL('./leads.db', import.meta.url))
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    page TEXT NOT NULL DEFAULT '',
    ip TEXT NOT NULL DEFAULT '',
    ua TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    pass_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'team',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS recovery_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    code_hash TEXT NOT NULL,
    used_at TEXT
  );
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event TEXT NOT NULL,
    ip TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)
const alters = [
  `ALTER TABLE leads ADD COLUMN notes TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN totp_secret TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE sessions ADD COLUMN ua TEXT NOT NULL DEFAULT ''`,
]
for (const a of alters) { try { db.exec(a) } catch { /* column exists */ } }

// One-time seed: PORTAL_USERS='[{"username":"...","name":"...","password":"..."}]'
if (env.PORTAL_USERS) {
  try {
    const seed = JSON.parse(env.PORTAL_USERS)
    const ins = db.prepare('INSERT OR IGNORE INTO users (username, name, pass_hash, salt) VALUES (?,?,?,?)')
    for (const u of seed) {
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = crypto.scryptSync(String(u.password), salt, 64).toString('hex')
      ins.run(String(u.username).toLowerCase(), String(u.name), hash, salt)
    }
    console.log(`portal users seeded (${seed.length})`)
  } catch (e) {
    console.error('PORTAL_USERS seed failed:', e.message)
  }
}

setInterval(() => {
  db.prepare(`DELETE FROM sessions WHERE expires_at < datetime('now')`).run()
}, 60 * 60 * 1000).unref()

// --- validation -----------------------------------------------------------
const TYPES = new Set(['mentor', 'partner', 'board', 'supporter', 'contact'])
const STATUSES = new Set(['new', 'contacted', 'closed'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// --- rate limiting --------------------------------------------------------
function limiter(max, windowMs) {
  const hits = new Map()
  setInterval(() => {
    const now = Date.now()
    for (const [k, arr] of hits) {
      const kept = arr.filter((t) => now - t < windowMs)
      if (kept.length === 0) hits.delete(k)
      else hits.set(k, kept)
    }
  }, 60 * 1000).unref()
  return (key) => {
    const now = Date.now()
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
    if (arr.length >= max) { hits.set(key, arr); return false }
    arr.push(now); hits.set(key, arr); return true
  }
}
const submitOk = limiter(5, 10 * 60 * 1000)   // public lead submissions
const loginOk = limiter(10, 10 * 60 * 1000)   // portal login attempts
const totpTry = limiter(8, 10 * 60 * 1000)    // TOTP / recovery attempts

// --- helpers ---------------------------------------------------------------
const json = (res, code, obj, extraHeaders = {}) => {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v)
  res.end(JSON.stringify(obj))
}
const str = (v, max) => String(v ?? '').trim().slice(0, max)
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

function readBody(req, cap = 16384) {
  return new Promise((resolve) => {
    let body = ''
    let tooBig = false
    req.on('data', (c) => {
      body += c
      if (body.length > cap) { tooBig = true; req.destroy() }
    })
    req.on('end', () => {
      if (tooBig) return resolve({ tooBig })
      try { resolve({ data: JSON.parse(body || '{}') }) }
      catch { resolve({ bad: true }) }
    })
  })
}

function parseCookies(req) {
  const out = {}
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}
function passwordOk(user, password) {
  const a = Buffer.from(hashPassword(password, user.salt), 'utf8')
  const b = Buffer.from(user.pass_hash, 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
function audit(userId, event, ip) {
  db.prepare('INSERT INTO audit_log (user_id, event, ip) VALUES (?,?,?)').run(userId ?? null, event, ip)
}

// --- TOTP (RFC 6238, SHA-1, 30s step, 6 digits) ---------------------------
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
function base32Encode(buf) {
  let bits = 0, val = 0, out = ''
  for (const b of buf) {
    val = (val << 8) | b; bits += 8
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31]
  return out
}
function base32Decode(s) {
  let bits = 0, val = 0
  const out = []
  for (const c of s.toUpperCase().replace(/=+$/, '')) {
    const i = B32.indexOf(c)
    if (i < 0) continue
    val = (val << 5) | i; bits += 5
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8 }
  }
  return Buffer.from(out)
}
function totpCode(secret, offsetSteps = 0) {
  const key = base32Decode(secret)
  const ctr = Buffer.alloc(8)
  ctr.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000) + offsetSteps))
  const h = crypto.createHmac('sha1', key).update(ctr).digest()
  const o = h[h.length - 1] & 0xf
  return ((h.readUInt32BE(o) & 0x7fffffff) % 1000000).toString().padStart(6, '0')
}
function totpVerify(secret, code) {
  const c = String(code).replace(/\s/g, '')
  return [0, -1, 1].some((s) => totpCode(secret, s) === c)
}

// --- sessions ---------------------------------------------------------------
function sessionUser(req) {
  const token = parseCookies(req)['portal_session']
  if (!token) return null
  const row = db
    .prepare(`SELECT u.id, u.username, u.name, u.role, u.totp_enabled FROM sessions s
              JOIN users u ON u.id = s.user_id
              WHERE s.token = ? AND s.expires_at > datetime('now')`)
    .get(token)
  return row ? { ...row, token } : null
}
function setSession(res, userId, ua) {
  const token = crypto.randomBytes(32).toString('hex')
  db.prepare(`INSERT INTO sessions (token, user_id, expires_at, ua)
              VALUES (?,?, datetime('now', '+' || ? || ' days'), ?)`)
    .run(token, userId, SESSION_DAYS, str(ua, 300))
  return `portal_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=${SESSION_DAYS * 86400}`
}
const clearCookie = 'portal_session=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0'

// Pending 2FA logins (short-lived, in-memory)
const pending = new Map()
function newPending(userId) {
  const token = crypto.randomBytes(24).toString('hex')
  pending.set(token, { userId, exp: Date.now() + 5 * 60 * 1000 })
  return token
}
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of pending) if (v.exp < now) pending.delete(k)
}, 60 * 1000).unref()

// --- recovery codes ----------------------------------------------------------
function genRecoveryCodes(userId) {
  db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(userId)
  const codes = []
  const ins = db.prepare('INSERT INTO recovery_codes (user_id, code_hash) VALUES (?,?)')
  for (let i = 0; i < 10; i++) {
    const raw = crypto.randomBytes(6).toString('hex').toUpperCase()
    const code = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`
    codes.push(code)
    ins.run(userId, sha256(code))
  }
  return codes
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

// --- server -----------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const ip = str(req.headers['x-real-ip'] || req.socket.remoteAddress, 64)

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return json(res, 200, { ok: true, service: 'chispark-api', ts: Date.now() })
  }

  // ---- public lead capture ----
  if (req.method === 'POST' && url.pathname === '/api/leads') {
    if (!submitOk(ip)) {
      return json(res, 429, { ok: false, error: 'Too many submissions — please try again in a few minutes.' })
    }
    const { data, bad, tooBig } = await readBody(req)
    if (tooBig) return json(res, 413, { ok: false, error: 'Message too large.' })
    if (bad) return json(res, 400, { ok: false, error: 'Bad request.' })
    if (data.company) return json(res, 200, { ok: true }) // honeypot

    const type = TYPES.has(data.type) ? data.type : 'contact'
    const name = str(data.name, 120)
    const email = str(data.email, 200)
    const message = str(data.message, 4000)
    const page = str(data.page, 200)
    if (!name || !EMAIL_RE.test(email) || !message) {
      return json(res, 422, { ok: false, error: 'Please provide your name, a valid email, and a message.' })
    }
    const r = db
      .prepare('INSERT INTO leads (type, name, email, message, page, ip, ua) VALUES (?,?,?,?,?,?,?)')
      .run(type, name, email, message, page, ip, str(req.headers['user-agent'], 300))
    return json(res, 200, { ok: true, id: Number(r.lastInsertRowid) })
  }

  // ---- auth: login (step 1) ----
  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    if (!loginOk(ip)) return json(res, 429, { ok: false, error: 'Too many attempts — try again shortly.' })
    const { data, bad } = await readBody(req)
    if (bad) return json(res, 400, { ok: false, error: 'Bad request.' })
    const username = str(data.username, 120).toLowerCase()
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    if (!user || !passwordOk(user, String(data.password ?? ''))) {
      audit(user?.id ?? null, 'login_failed', ip)
      return json(res, 401, { ok: false, error: 'Invalid username or password.' })
    }
    if (user.totp_enabled) {
      return json(res, 200, { ok: true, totpRequired: true, pending: newPending(user.id) })
    }
    audit(user.id, 'login', ip)
    const cookie = setSession(res, user.id, req.headers['user-agent'])
    return json(res, 200, { ok: true, user: pubUser(user) }, { 'Set-Cookie': cookie })
  }

  // ---- auth: login (step 2, TOTP) ----
  if (req.method === 'POST' && url.pathname === '/api/auth/totp') {
    if (!totpTry(ip)) return json(res, 429, { ok: false, error: 'Too many attempts — try again shortly.' })
    const { data, bad } = await readBody(req)
    if (bad) return json(res, 400, { ok: false, error: 'Bad request.' })
    const p = pending.get(str(data.pending, 80))
    if (!p || p.exp < Date.now()) return json(res, 401, { ok: false, error: 'Login session expired — sign in again.' })
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(p.userId)
    if (!user || !totpVerify(user.totp_secret, data.code ?? '')) {
      audit(p.userId, 'totp_failed', ip)
      return json(res, 401, { ok: false, error: 'Invalid authenticator code.' })
    }
    pending.delete(str(data.pending, 80))
    audit(user.id, 'login_2fa', ip)
    const cookie = setSession(res, user.id, req.headers['user-agent'])
    return json(res, 200, { ok: true, user: pubUser(user) }, { 'Set-Cookie': cookie })
  }

  // ---- auth: forgot password via recovery code ----
  if (req.method === 'POST' && url.pathname === '/api/auth/forgot') {
    if (!totpTry(ip)) return json(res, 429, { ok: false, error: 'Too many attempts — try again shortly.' })
    const { data, bad } = await readBody(req)
    if (bad) return json(res, 400, { ok: false, error: 'Bad request.' })
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(str(data.username, 120).toLowerCase())
    const next = String(data.next ?? '')
    if (next.length < MIN_PASSWORD) {
      return json(res, 422, { ok: false, error: `New password must be at least ${MIN_PASSWORD} characters.` })
    }
    const codeHash = sha256(str(data.recoveryCode, 40).toUpperCase())
    const row = user
      ? db.prepare('SELECT * FROM recovery_codes WHERE user_id = ? AND code_hash = ? AND used_at IS NULL').get(user.id, codeHash)
      : null
    if (!user || !row) {
      audit(user?.id ?? null, 'recovery_failed', ip)
      return json(res, 401, { ok: false, error: 'Invalid username or recovery code.' })
    }
    db.prepare(`UPDATE recovery_codes SET used_at = datetime('now') WHERE id = ?`).run(row.id)
    const salt = crypto.randomBytes(16).toString('hex')
    db.prepare('UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?').run(hashPassword(next, salt), salt, user.id)
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id)
    audit(user.id, 'password_reset_recovery', ip)
    return json(res, 200, { ok: true })
  }

  // ---- everything below requires a session ----
  const me = sessionUser(req)

  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    if (me) db.prepare('DELETE FROM sessions WHERE token = ?').run(me.token)
    return json(res, 200, { ok: true }, { 'Set-Cookie': clearCookie })
  }

  if (req.method === 'GET' && url.pathname === '/api/auth/me') {
    if (!me) return json(res, 401, { ok: false })
    const codesLeft = db.prepare('SELECT COUNT(*) AS n FROM recovery_codes WHERE user_id = ? AND used_at IS NULL').get(me.id).n
    return json(res, 200, { ok: true, user: pubUser(me), recoveryCodesLeft: codesLeft })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/password') {
    if (!me) return json(res, 401, { ok: false })
    const { data, bad } = await readBody(req)
    if (bad) return json(res, 400, { ok: false, error: 'Bad request.' })
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id)
    if (!passwordOk(row, String(data.current ?? ''))) {
      return json(res, 403, { ok: false, error: 'Current password is incorrect.' })
    }
    const next = String(data.next ?? '')
    if (next.length < MIN_PASSWORD) {
      return json(res, 422, { ok: false, error: `New password must be at least ${MIN_PASSWORD} characters.` })
    }
    const salt = crypto.randomBytes(16).toString('hex')
    db.prepare('UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?').run(hashPassword(next, salt), salt, me.id)
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(me.id)
    audit(me.id, 'password_changed', ip)
    return json(res, 200, { ok: true }, { 'Set-Cookie': clearCookie })
  }

  // ---- 2FA enrollment ----
  if (req.method === 'POST' && url.pathname === '/api/auth/totp/setup') {
    if (!me) return json(res, 401, { ok: false })
    const { data } = await readBody(req)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id)
    if (!passwordOk(row, String(data?.password ?? ''))) {
      return json(res, 403, { ok: false, error: 'Password is incorrect.' })
    }
    const secret = base32Encode(crypto.randomBytes(20))
    db.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?').run(secret, me.id)
    const label = encodeURIComponent(me.username)
    const issuer = encodeURIComponent('Chi-Spark AI')
    return json(res, 200, {
      ok: true,
      secret,
      otpauth: `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}`,
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/totp/enable') {
    if (!me) return json(res, 401, { ok: false })
    const { data } = await readBody(req)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id)
    if (!row.totp_secret || !totpVerify(row.totp_secret, data?.code ?? '')) {
      return json(res, 422, { ok: false, error: 'Code does not match — check your authenticator and try again.' })
    }
    db.prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').run(me.id)
    const codes = genRecoveryCodes(me.id)
    audit(me.id, 'totp_enabled', ip)
    return json(res, 200, { ok: true, recoveryCodes: codes })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/totp/disable') {
    if (!me) return json(res, 401, { ok: false })
    const { data } = await readBody(req)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id)
    if (!passwordOk(row, String(data?.password ?? '')) || !totpVerify(row.totp_secret, data?.code ?? '')) {
      return json(res, 403, { ok: false, error: 'Password or authenticator code is incorrect.' })
    }
    db.prepare(`UPDATE users SET totp_enabled = 0, totp_secret = '' WHERE id = ?`).run(me.id)
    db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(me.id)
    audit(me.id, 'totp_disabled', ip)
    return json(res, 200, { ok: true })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/recovery-codes') {
    if (!me) return json(res, 401, { ok: false })
    const { data } = await readBody(req)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id)
    if (!passwordOk(row, String(data?.password ?? ''))) {
      return json(res, 403, { ok: false, error: 'Password is incorrect.' })
    }
    if (!row.totp_enabled) {
      return json(res, 422, { ok: false, error: 'Enable two-factor authentication first.' })
    }
    const codes = genRecoveryCodes(me.id)
    audit(me.id, 'recovery_regenerated', ip)
    return json(res, 200, { ok: true, recoveryCodes: codes })
  }

  // ---- sessions & activity ----
  if (req.method === 'GET' && url.pathname === '/api/auth/sessions') {
    if (!me) return json(res, 401, { ok: false })
    const rows = db
      .prepare(`SELECT token, created_at, expires_at, ua FROM sessions
                WHERE user_id = ? AND expires_at > datetime('now') ORDER BY created_at DESC`)
      .all(me.id)
    return json(res, 200, {
      ok: true,
      sessions: rows.map((s) => ({
        current: s.token === me.token,
        created_at: s.created_at,
        expires_at: s.expires_at,
        ua: s.ua || 'Unknown device',
      })),
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/sessions/revoke-others') {
    if (!me) return json(res, 401, { ok: false })
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(me.id, me.token)
    audit(me.id, 'sessions_revoked', ip)
    return json(res, 200, { ok: true })
  }

  if (req.method === 'GET' && url.pathname === '/api/auth/activity') {
    if (!me) return json(res, 401, { ok: false })
    const rows = db
      .prepare('SELECT event, ip, created_at FROM audit_log WHERE user_id = ? ORDER BY id DESC LIMIT 20')
      .all(me.id)
    return json(res, 200, { ok: true, activity: rows })
  }

  // ---- admin: reset a teammate's password ----
  if (req.method === 'GET' && url.pathname === '/api/admin/users') {
    if (!me || me.role !== 'admin') return json(res, 403, { ok: false, error: 'Admins only.' })
    const rows = db.prepare('SELECT id, username, name, role, totp_enabled FROM users ORDER BY name').all()
    return json(res, 200, { ok: true, users: rows })
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/reset-password') {
    if (!me || me.role !== 'admin') return json(res, 403, { ok: false, error: 'Admins only.' })
    const { data } = await readBody(req)
    const target = db.prepare('SELECT * FROM users WHERE username = ?').get(str(data?.username, 120).toLowerCase())
    if (!target) return json(res, 404, { ok: false, error: 'User not found.' })
    const temp = crypto.randomBytes(9).toString('base64url') + '!' + crypto.randomInt(10, 99)
    const salt = crypto.randomBytes(16).toString('hex')
    db.prepare('UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?').run(hashPassword(temp, salt), salt, target.id)
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id)
    audit(me.id, `admin_reset_${target.username}`, ip)
    audit(target.id, 'password_reset_admin', ip)
    return json(res, 200, { ok: true, tempPassword: temp, name: target.name })
  }

  // ---- portal data ----
  if (req.method === 'GET' && url.pathname === '/api/portal/leads') {
    if (!me) return json(res, 401, { ok: false })
    const where = []
    const args = []
    if (TYPES.has(url.searchParams.get('type'))) { where.push('type = ?'); args.push(url.searchParams.get('type')) }
    if (STATUSES.has(url.searchParams.get('status'))) { where.push('status = ?'); args.push(url.searchParams.get('status')) }
    const q = str(url.searchParams.get('q'), 80)
    if (q) { where.push('(name LIKE ? OR email LIKE ? OR message LIKE ?)'); args.push(`%${q}%`, `%${q}%`, `%${q}%`) }
    const sql = `SELECT id, type, name, email, message, page, status, notes, created_at
                 FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY id DESC LIMIT 1000`
    const rows = db.prepare(sql).all(...args)
    return json(res, 200, { ok: true, leads: rows })
  }

  if (req.method === 'GET' && url.pathname === '/api/portal/leads.csv') {
    if (!me) return json(res, 401, { ok: false })
    const rows = db.prepare('SELECT id, type, name, email, message, page, status, notes, created_at FROM leads ORDER BY id DESC').all()
    const header = 'id,type,name,email,message,page,status,notes,created_at'
    const body = rows.map((r) =>
      [r.id, r.type, r.name, r.email, r.message, r.page, r.status, r.notes, r.created_at].map(csvCell).join(',')
    ).join('\n')
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="chispark-leads-${new Date().toISOString().slice(0, 10)}.csv"`)
    return res.end(header + '\n' + body + '\n')
  }

  const leadMatch = url.pathname.match(/^\/api\/portal\/leads\/(\d+)$/)
  if (leadMatch && req.method === 'PATCH') {
    if (!me) return json(res, 401, { ok: false })
    const { data, bad } = await readBody(req)
    if (bad) return json(res, 400, { ok: false, error: 'Bad request.' })
    const id = parseInt(leadMatch[1], 10)
    const sets = []
    const args = []
    if (data.status !== undefined) {
      if (!STATUSES.has(data.status)) return json(res, 422, { ok: false, error: 'Bad status.' })
      sets.push('status = ?'); args.push(data.status)
    }
    if (data.notes !== undefined) { sets.push('notes = ?'); args.push(str(data.notes, 4000)) }
    if (!sets.length) return json(res, 422, { ok: false, error: 'Nothing to update.' })
    args.push(id)
    const r = db.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`).run(...args)
    if (!r.changes) return json(res, 404, { ok: false, error: 'Lead not found.' })
    const row = db.prepare('SELECT id, type, name, email, message, page, status, notes, created_at FROM leads WHERE id = ?').get(id)
    return json(res, 200, { ok: true, lead: row })
  }

  // ---- legacy admin token export ----
  if (req.method === 'GET' && url.pathname === '/api/leads') {
    if (!ADMIN_TOKEN || req.headers['authorization'] !== `Bearer ${ADMIN_TOKEN}`) {
      return json(res, 401, { ok: false, error: 'Unauthorized' })
    }
    const rows = db.prepare('SELECT * FROM leads ORDER BY id DESC LIMIT 500').all()
    return json(res, 200, { ok: true, leads: rows })
  }

  json(res, 404, { ok: false, error: 'Not found' })
})

function pubUser(u) {
  return { username: u.username, name: u.name, role: u.role, totpEnabled: !!u.totp_enabled }
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`chispark-api listening on 127.0.0.1:${PORT}`)
})
