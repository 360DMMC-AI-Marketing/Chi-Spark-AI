import { useCallback, useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import {
  portalApi,
  type ActivityEntry,
  type LeadStatus,
  type PortalLead,
  type PortalUser,
  type SessionInfo,
} from '../lib/portal'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'

const TYPE_STYLES: Record<string, string> = {
  mentor: 'bg-sky/15 text-sky',
  partner: 'bg-teal/15 text-teal',
  board: 'bg-fg/10 text-fg',
  supporter: 'bg-spark/15 text-spark',
  contact: 'bg-fg/5 text-fg/60',
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-spark/15 text-spark',
  contacted: 'bg-sky/15 text-sky',
  closed: 'bg-teal/15 text-teal',
}

const STATUSES: LeadStatus[] = ['new', 'contacted', 'closed']
const TYPES = ['mentor', 'partner', 'board', 'supporter', 'contact']

function fmtDate(s: string) {
  const d = new Date(s.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime())
    ? s
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDateTime(s: string) {
  const d = new Date(s.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime())
    ? s
    : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const input =
  'mt-1.5 w-full rounded-lg border border-fg/15 px-3 py-2.5 text-sm text-fg outline-none focus:border-spark'
const label = 'block text-xs font-semibold uppercase tracking-wider text-fg/50'
const btnSpark =
  'rounded-lg bg-spark px-4 py-2.5 text-sm font-bold text-white transition hover:bg-spark-light disabled:opacity-50'
const btnInk =
  'rounded-lg bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-ink-dark disabled:opacity-40'

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : 'Something went wrong.'
}

/* ------------------------------------------------------------------ login */

function LoginCard({ onLogin }: { onLogin: (u: PortalUser) => void }) {
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState('')
  const [code, setCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [next, setNext] = useState('')
  const [next2, setNext2] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const r = await portalApi.login(username, password)
      if (r.totpRequired && r.pending) {
        setPending(r.pending)
      } else if (r.user) {
        onLogin(r.user)
      }
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  async function submitTotp(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { user } = await portalApi.completeTotp(pending, code)
      onLogin(user)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault()
    if (next !== next2) {
      setError('New passwords do not match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await portalApi.forgot(username, recoveryCode, next)
      setMode('login')
      setPassword('')
      setNotice('Password reset — sign in with your new password.')
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle scrolled />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <a href="/" aria-label="Chi-Spark AI home" className="transition-opacity hover:opacity-80">
            <Logo />
          </a>
        </div>

        {pending ? (
          <form onSubmit={submitTotp} className="rounded-2xl bg-surface p-8 shadow-2xl">
            <h1 className="text-lg font-bold text-fg">Two-factor check</h1>
            <p className="mt-1 text-sm text-fg/50">
              Enter the 6-digit code from your authenticator app.
            </p>
            <label className={`${label} mt-6`}>
              Authenticator code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                className={`${input} text-center text-lg tracking-[0.5em]`}
              />
            </label>
            {error && <p className="mt-4 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
            <button type="submit" disabled={busy || code.length !== 6} className={`${btnSpark} mt-6 w-full`}>
              {busy ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => { setPending(''); setCode(''); setError('') }}
              className="mt-3 w-full text-center text-xs text-fg/40 hover:text-fg"
            >
              ← Back to sign in
            </button>
          </form>
        ) : mode === 'forgot' ? (
          <form onSubmit={submitForgot} className="rounded-2xl bg-surface p-8 shadow-2xl">
            <h1 className="text-lg font-bold text-fg">Reset password</h1>
            <p className="mt-1 text-sm text-fg/50">
              Use one of your one-time recovery codes to set a new password.
            </p>
            <label className={`${label} mt-6`}>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required className={input} />
            </label>
            <label className={`${label} mt-4`}>
              Recovery code
              <input
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                required
                className={input}
              />
            </label>
            <label className={`${label} mt-4`}>
              New password (12+ characters)
              <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={12} autoComplete="new-password" className={input} />
            </label>
            <label className={`${label} mt-4`}>
              Confirm new password
              <input type="password" value={next2} onChange={(e) => setNext2(e.target.value)} required minLength={12} autoComplete="new-password" className={input} />
            </label>
            {error && <p className="mt-4 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
            <button type="submit" disabled={busy} className={`${btnSpark} mt-6 w-full`}>
              {busy ? 'Resetting…' : 'Reset password'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className="mt-3 w-full text-center text-xs text-fg/40 hover:text-fg"
            >
              ← Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={submitLogin} className="rounded-2xl bg-surface p-8 shadow-2xl">
            <h1 className="text-lg font-bold text-fg">Team portal</h1>
            <p className="mt-1 text-sm text-fg/50">Sign in to manage leads and interest.</p>
            {notice && <p className="mt-4 rounded-lg bg-teal/10 px-3 py-2 text-sm text-teal">{notice}</p>}
            <label className={`${label} mt-6`}>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required className={input} />
            </label>
            <label className={`${label} mt-4`}>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className={input} />
            </label>
            {error && <p className="mt-4 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
            <button type="submit" disabled={busy} className={`${btnSpark} mt-6 w-full`}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); setNotice('') }}
              className="mt-3 w-full text-center text-xs text-fg/40 hover:text-fg"
            >
              Forgot password?
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-fg/40">
          Chi-Spark AI internal — authorized team only.
        </p>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- lead row */

function LeadRow({ lead, onSaved }: { lead: PortalLead; onSaved: (l: PortalLead) => void }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(lead.notes)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(patch: { status?: LeadStatus; notes?: string }) {
    setBusy(true)
    setError('')
    try {
      const { lead: updated } = await portalApi.updateLead(lead.id, patch)
      onSaved(updated)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <tr onClick={() => setOpen((o) => !o)} className="cursor-pointer border-b border-fg/5 transition hover:bg-fg/[0.02]">
        <td className="whitespace-nowrap px-4 py-3 text-sm text-fg/50">{fmtDate(lead.created_at)}</td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${TYPE_STYLES[lead.type] || TYPE_STYLES.contact}`}>
            {lead.type}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="text-sm font-semibold text-fg">{lead.name}</div>
          <div className="text-xs text-fg/50">{lead.email}</div>
        </td>
        <td className="hidden max-w-xs truncate px-4 py-3 text-sm text-fg/60 lg:table-cell">{lead.message}</td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[lead.status]}`}>
            {lead.status}
          </span>
        </td>
        <td className="px-4 py-3 text-right text-fg/30">{open ? '▾' : '▸'}</td>
      </tr>

      {open && (
        <tr className="border-b border-fg/5 bg-fg/[0.02]">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-fg/40">Message</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface p-3 text-sm text-fg/80">{lead.message}</p>
                <p className="mt-2 text-xs text-fg/40">
                  From page: {lead.page || '—'} ·{' '}
                  <a className="text-sky hover:underline" href={`mailto:${lead.email}`}>
                    email {lead.name.split(' ')[0]}
                  </a>
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-fg/40">
                    Status
                    <select
                      value={lead.status}
                      disabled={busy}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => save({ status: e.target.value as LeadStatus })}
                      className="ml-2 rounded-lg border border-fg/15 bg-surface px-2 py-1.5 text-xs font-semibold text-fg normal-case"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </label>
                  {busy && <span className="text-xs text-fg/40">saving…</span>}
                </div>
                <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-fg/40">
                  Internal notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    rows={3}
                    placeholder="Who followed up, what was said, next step…"
                    className="mt-1.5 w-full rounded-lg border border-fg/15 bg-surface px-3 py-2 text-sm normal-case text-fg outline-none focus:border-spark"
                  />
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); save({ notes }) }}
                    disabled={busy || notes === lead.notes}
                    className={btnInk}
                  >
                    Save notes
                  </button>
                  {error && <span className="text-xs text-flag-red">{error}</span>}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* -------------------------------------------------------- security screens */

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface p-6 shadow-sm">
      <h2 className="text-base font-bold text-fg">{title}</h2>
      {desc && <p className="mt-1 text-sm text-fg/50">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  const text = `Chi-Spark AI — recovery codes (each works once)\n\n${codes.join('\n')}\n`
  return (
    <div className="rounded-xl border-2 border-spark/40 bg-spark/5 p-4">
      <p className="text-sm font-bold text-fg">Save these recovery codes</p>
      <p className="mt-1 text-xs text-fg/60">
        Each code works once. This is the only way back in if you lose your password — they are shown
        only now.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-fg sm:grid-cols-3">
        {codes.map((c) => (
          <span key={c} className="rounded bg-surface px-2 py-1 text-center">{c}</span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => { navigator.clipboard.writeText(text); setCopied(true) }}
          className={btnInk}
        >
          {copied ? 'Copied ✓' : 'Copy all'}
        </button>
        <a
          href={URL.createObjectURL(new Blob([text], { type: 'text/plain' }))}
          download="chispark-recovery-codes.txt"
          className="rounded-lg bg-teal px-4 py-2 text-xs font-bold text-white hover:opacity-90"
        >
          Download .txt
        </a>
        <button onClick={onDone} className="rounded-lg px-4 py-2 text-xs font-bold text-fg/50 hover:text-fg">
          I saved them
        </button>
      </div>
    </div>
  )
}

function TwoFactorCard({ user, onRefresh }: { user: PortalUser; onRefresh: () => void }) {
  const [step, setStep] = useState<'idle' | 'password' | 'scan'>('idle')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [qr, setQr] = useState('')
  const [code, setCode] = useState('')
  const [codes, setCodes] = useState<string[] | null>(null)
  const [disablePw, setDisablePw] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [regenPw, setRegenPw] = useState('')
  const [showDisable, setShowDisable] = useState(false)
  const [showRegen, setShowRegen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function startSetup(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await portalApi.totpSetup(password)
      setSecret(r.secret)
      setQr(await QRCode.toDataURL(r.otpauth, { width: 200, margin: 1 }))
      setStep('scan')
    } catch (err) { setError(errMsg(err)) } finally { setBusy(false) }
  }

  async function enable(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await portalApi.totpEnable(code)
      setCodes(r.recoveryCodes)
      onRefresh()
    } catch (err) { setError(errMsg(err)) } finally { setBusy(false) }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await portalApi.totpDisable(disablePw, disableCode)
      setShowDisable(false); setDisablePw(''); setDisableCode('')
      onRefresh()
    } catch (err) { setError(errMsg(err)) } finally { setBusy(false) }
  }

  async function regen(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await portalApi.regenRecoveryCodes(regenPw)
      setCodes(r.recoveryCodes)
      setShowRegen(false); setRegenPw('')
    } catch (err) { setError(errMsg(err)) } finally { setBusy(false) }
  }

  return (
    <Card
      title="Two-factor authentication"
      desc="Require a 6-digit authenticator-app code in addition to your password."
    >
      {codes && <RecoveryCodes codes={codes} onDone={() => setCodes(null)} />}

      {!codes && !user.totpEnabled && step === 'idle' && (
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-flag-red/10 px-3 py-1 text-xs font-bold text-flag-red">Not enabled</span>
          <button onClick={() => setStep('password')} className={btnSpark}>Set up 2FA</button>
        </div>
      )}

      {!codes && !user.totpEnabled && step === 'password' && (
        <form onSubmit={startSetup} className="max-w-xs">
          <label className={label}>
            Confirm your password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={input} />
          </label>
          {error && <p className="mt-3 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={busy} className={btnSpark}>{busy ? 'Checking…' : 'Continue'}</button>
            <button type="button" onClick={() => { setStep('idle'); setError('') }} className="px-3 text-xs font-bold text-fg/50">Cancel</button>
          </div>
        </form>
      )}

      {!codes && !user.totpEnabled && step === 'scan' && (
        <form onSubmit={enable}>
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            {qr && <img src={qr} alt="2FA QR code" className="rounded-lg border border-fg/10" />}
            <div className="text-sm text-fg/70">
              <p className="font-semibold text-fg">1. Scan with your authenticator app</p>
              <p className="mt-1">Google Authenticator, Authy, 1Password, etc.</p>
              <p className="mt-3 font-semibold text-fg">Can't scan? Enter manually:</p>
              <code className="mt-1 block break-all rounded bg-fg/5 px-2 py-1 text-xs">{secret}</code>
            </div>
          </div>
          <label className={`${label} mt-4 max-w-xs`}>
            2. Enter the 6-digit code to confirm
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className={input}
            />
          </label>
          {error && <p className="mt-3 max-w-xs rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
          <button type="submit" disabled={busy || code.length !== 6} className={`${btnSpark} mt-3`}>
            {busy ? 'Verifying…' : 'Enable 2FA'}
          </button>
        </form>
      )}

      {!codes && user.totpEnabled && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal">Enabled ✓</span>
            <div className="flex gap-2">
              <button onClick={() => { setShowRegen((s) => !s); setShowDisable(false); setError('') }} className={btnInk}>
                New recovery codes
              </button>
              <button
                onClick={() => { setShowDisable((s) => !s); setShowRegen(false); setError('') }}
                className="rounded-lg bg-flag-red/10 px-4 py-2 text-xs font-bold text-flag-red hover:bg-flag-red/20"
              >
                Disable 2FA
              </button>
            </div>
          </div>

          {showRegen && (
            <form onSubmit={regen} className="mt-4 max-w-xs rounded-xl bg-fg/[0.03] p-4">
              <p className="text-xs text-fg/60">Old codes stop working immediately.</p>
              <label className={`${label} mt-2`}>
                Confirm password
                <input type="password" value={regenPw} onChange={(e) => setRegenPw(e.target.value)} required className={input} />
              </label>
              <button type="submit" disabled={busy} className={`${btnInk} mt-3`}>Generate new codes</button>
            </form>
          )}

          {showDisable && (
            <form onSubmit={disable} className="mt-4 max-w-xs rounded-xl bg-fg/[0.03] p-4">
              <label className={label}>
                Password
                <input type="password" value={disablePw} onChange={(e) => setDisablePw(e.target.value)} required className={input} />
              </label>
              <label className={`${label} mt-3`}>
                Authenticator code
                <input value={disableCode} onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" required className={input} />
              </label>
              <button type="submit" disabled={busy} className="mt-3 rounded-lg bg-flag-red px-4 py-2 text-xs font-bold text-white hover:opacity-90">
                Disable 2FA
              </button>
            </form>
          )}

          {error && <p className="mt-3 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
        </div>
      )}
    </Card>
  )
}

function PasswordCard({ onChanged }: { onChanged: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [next2, setNext2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== next2) { setError('New passwords do not match.'); return }
    setBusy(true); setError('')
    try {
      await portalApi.changePassword(current, next)
      onChanged()
    } catch (err) { setError(errMsg(err)); setBusy(false) }
  }

  return (
    <Card title="Change password" desc="You'll be signed out everywhere and can sign back in with the new password.">
      <form onSubmit={submit} className="max-w-xs">
        <label className={label}>
          Current password
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" className={input} />
        </label>
        <label className={`${label} mt-3`}>
          New password (12+ characters)
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={12} autoComplete="new-password" className={input} />
        </label>
        <label className={`${label} mt-3`}>
          Confirm new password
          <input type="password" value={next2} onChange={(e) => setNext2(e.target.value)} required minLength={12} autoComplete="new-password" className={input} />
        </label>
        {error && <p className="mt-3 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnSpark} mt-4`}>
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </Card>
  )
}

function SessionsCard() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    portalApi.sessions().then((r) => setSessions(r.sessions)).catch((e) => setError(errMsg(e)))
  }, [])
  useEffect(load, [load])

  async function revoke() {
    setBusy(true)
    try { await portalApi.revokeOtherSessions(); load() } catch (e) { setError(errMsg(e)) } finally { setBusy(false) }
  }

  return (
    <Card title="Active sessions" desc="Devices currently signed in to your account.">
      {error && <p className="rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
      <ul className="divide-y divide-fg/5">
        {sessions.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="min-w-0">
              <p className="truncate text-fg/80">{s.ua}</p>
              <p className="text-xs text-fg/40">Signed in {fmtDateTime(s.created_at)}</p>
            </div>
            {s.current && <span className="shrink-0 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-bold text-teal">This device</span>}
          </li>
        ))}
      </ul>
      {sessions.length > 1 && (
        <button onClick={revoke} disabled={busy} className={`${btnInk} mt-3`}>
          Sign out all other devices
        </button>
      )}
    </Card>
  )
}

function ActivityCard() {
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    portalApi.activity().then((r) => setActivity(r.activity)).catch((e) => setError(errMsg(e)))
  }, [])

  const EVENT_LABELS: Record<string, string> = {
    login: 'Signed in',
    login_2fa: 'Signed in (2FA)',
    login_failed: 'Failed sign-in attempt',
    totp_enabled: 'Enabled 2FA',
    totp_disabled: 'Disabled 2FA',
    totp_failed: 'Failed 2FA attempt',
    password_changed: 'Changed password',
    password_reset_recovery: 'Password reset via recovery code',
    password_reset_admin: 'Password reset by admin',
    recovery_regenerated: 'Regenerated recovery codes',
    recovery_failed: 'Failed recovery attempt',
    sessions_revoked: 'Signed out other devices',
  }

  return (
    <Card title="Recent security activity" desc="Last 20 events on your account.">
      {error && <p className="rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
      <ul className="divide-y divide-fg/5">
        {activity.map((a, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="text-fg/80">{EVENT_LABELS[a.event] || a.event}</span>
            <span className="shrink-0 text-xs text-fg/40">{fmtDateTime(a.created_at)}</span>
          </li>
        ))}
        {activity.length === 0 && !error && <li className="py-3 text-sm text-fg/40">No activity yet.</li>}
      </ul>
    </Card>
  )
}

function AdminCard() {
  const [users, setUsers] = useState<{ username: string; name: string; totp_enabled: number }[]>([])
  const [selected, setSelected] = useState('')
  const [temp, setTemp] = useState<{ name: string; pw: string } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    portalApi.adminUsers().then((r) => setUsers(r.users)).catch(() => setUsers([]))
  }, [])

  async function reset(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(''); setTemp(null)
    try {
      const r = await portalApi.adminReset(selected)
      setTemp({ name: r.name, pw: r.tempPassword })
    } catch (err) { setError(errMsg(err)) } finally { setBusy(false) }
  }

  return (
    <Card title="Admin — reset a teammate's password" desc="Generates a one-time temporary password and signs them out everywhere.">
      <form onSubmit={reset} className="flex max-w-md flex-wrap items-end gap-2">
        <label className={`${label} flex-1`}>
          Teammate
          <select value={selected} onChange={(e) => setSelected(e.target.value)} required className={input}>
            <option value="">Select…</option>
            {users.map((u) => (
              <option key={u.username} value={u.username}>
                {u.name} ({u.username}){u.totp_enabled ? ' · 2FA' : ''}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={busy || !selected} className={btnSpark}>
          {busy ? 'Resetting…' : 'Reset'}
        </button>
      </form>
      {error && <p className="mt-3 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>}
      {temp && (
        <div className="mt-4 rounded-xl border-2 border-spark/40 bg-spark/5 p-4">
          <p className="text-sm font-bold text-fg">Temporary password for {temp.name}</p>
          <code className="mt-2 block rounded bg-surface px-3 py-2 text-center font-mono text-sm">{temp.pw}</code>
          <p className="mt-2 text-xs text-fg/60">Shown once — send it to them securely. They should change it after signing in.</p>
        </div>
      )}
    </Card>
  )
}

function Settings({ user, onRefresh, onForceLogout }: { user: PortalUser; onRefresh: () => void; onForceLogout: () => void }) {
  const [codesLeft, setCodesLeft] = useState<number | null>(null)
  useEffect(() => {
    portalApi.me().then((r) => setCodesLeft(r.recoveryCodesLeft)).catch(() => {})
  }, [user])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TwoFactorCard user={user} onRefresh={onRefresh} />
      <PasswordCard onChanged={onForceLogout} />
      <SessionsCard />
      <ActivityCard />
      {user.role === 'admin' && <div className="lg:col-span-2"><AdminCard /></div>}
      {user.totpEnabled && codesLeft !== null && codesLeft <= 2 && (
        <p className="rounded-lg bg-flag-red/10 px-4 py-3 text-sm text-flag-red lg:col-span-2">
          Only {codesLeft} recovery code{codesLeft === 1 ? '' : 's'} left — generate a new set above.
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- dashboard */

function Dashboard({ user, onLogout, onRefresh }: { user: PortalUser; onLogout: () => void; onRefresh: () => void }) {
  const [view, setView] = useState<'leads' | 'security'>('leads')
  const [leads, setLeads] = useState<PortalLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { leads } = await portalApi.leads({ type, status, q })
      setLeads(leads)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }, [type, status, q])

  useEffect(() => {
    if (view !== 'leads') return
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load, view])

  const stats = useMemo(() => {
    const fresh = leads.filter((l) => l.status === 'new').length
    return { total: leads.length, fresh }
  }, [leads])

  function saved(updated: PortalLead) {
    setLeads((ls) => ls.map((l) => (l.id === updated.id ? updated : l)))
  }

  async function logout() {
    try { await portalApi.logout() } catch { /* session gone anyway */ }
    onLogout()
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink-dark text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/" aria-label="Chi-Spark AI home" className="transition-opacity hover:opacity-80">
              <Logo dark />
            </a>
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold sm:inline">Team portal</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ThemeToggle scrolled={false} />
            <span className="hidden text-white/60 sm:inline">{user.name}</span>
            <button
              onClick={() => setView(view === 'leads' ? 'security' : 'leads')}
              className="rounded-lg bg-white/10 px-3 py-1.5 font-semibold hover:bg-white/20"
            >
              {view === 'leads' ? 'Security' : '← Leads'}
            </button>
            <a href="/" className="text-white/50 hover:text-white">View site</a>
            <button onClick={logout} className="rounded-lg bg-white/10 px-3 py-1.5 font-semibold hover:bg-white/20">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {view === 'security' ? (
          <>
            <h1 className="text-2xl font-bold text-fg">Security settings</h1>
            {!user.totpEnabled && (
              <p className="mt-3 rounded-lg bg-spark/10 px-4 py-3 text-sm text-fg/70">
                <span className="font-bold text-spark">Recommended:</span> enable two-factor
                authentication — it protects the portal even if your password leaks.
              </p>
            )}
            <div className="mt-6">
              <Settings user={user} onRefresh={onRefresh} onForceLogout={onLogout} />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-fg">Leads</h1>
                <p className="mt-1 text-sm text-fg/50">
                  {stats.total} shown · <span className="font-semibold text-spark">{stats.fresh} new</span>
                </p>
              </div>
              <a href="/api/portal/leads.csv" className="rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
                Export CSV
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-fg/15 bg-surface px-3 py-2 text-sm text-fg">
                <option value="">All types</option>
                {TYPES.map((t) => (<option key={t} value={t} className="capitalize">{t}</option>))}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-fg/15 bg-surface px-3 py-2 text-sm text-fg">
                <option value="">All statuses</option>
                {STATUSES.map((s) => (<option key={s} value={s} className="capitalize">{s}</option>))}
              </select>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, message…"
                className="min-w-56 flex-1 rounded-lg border border-fg/15 bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-spark"
              />
            </div>

            {error && <p className="mt-4 rounded-lg bg-flag-red/10 px-4 py-3 text-sm text-flag-red">{error}</p>}

            <div className="mt-4 overflow-x-auto rounded-2xl bg-surface shadow-sm">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-fg/10 text-xs font-semibold uppercase tracking-wider text-fg/40">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="hidden px-4 py-3 lg:table-cell">Message</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (<LeadRow key={l.id} lead={l} onSaved={saved} />))}
                  {!loading && leads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-fg/40">
                        No leads match — when the site forms get submissions, they land here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {loading && <p className="px-4 py-6 text-center text-sm text-fg/40">Loading…</p>}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

/* ----------------------------------------------------------------- shell */

export function Portal() {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [checking, setChecking] = useState(true)

  const refresh = useCallback(() => {
    portalApi.me().then(({ user }) => setUser(user)).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    portalApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-fg/50">
        Loading…
      </div>
    )
  }
  return user ? (
    <Dashboard user={user} onLogout={() => setUser(null)} onRefresh={refresh} />
  ) : (
    <LoginCard onLogin={setUser} />
  )
}
