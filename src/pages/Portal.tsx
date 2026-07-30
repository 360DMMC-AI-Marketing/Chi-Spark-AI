import { useCallback, useEffect, useMemo, useState } from 'react'
import { portalApi, type LeadStatus, type PortalLead, type PortalUser } from '../lib/portal'
import { Logo } from '../components/Logo'

const TYPE_STYLES: Record<string, string> = {
  mentor: 'bg-sky/15 text-sky',
  partner: 'bg-teal/15 text-teal',
  board: 'bg-ink/10 text-ink',
  supporter: 'bg-spark/15 text-spark',
  contact: 'bg-ink/5 text-ink/60',
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

/* ------------------------------------------------------------------ login */

function LoginCard({ onLogin }: { onLogin: (u: PortalUser) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { user } = await portalApi.login(username, password)
      onLogin(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-dark px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo dark />
        </div>
        <form onSubmit={submit} className="rounded-2xl bg-white p-8 shadow-2xl">
          <h1 className="text-lg font-bold text-ink">Team portal</h1>
          <p className="mt-1 text-sm text-ink/50">Sign in to manage leads and interest.</p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-spark"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-spark"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-lg bg-flag-red/10 px-3 py-2 text-sm text-flag-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-spark py-2.5 text-sm font-bold text-white transition hover:bg-spark-light disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-white/30">
          Chi-Spark AI internal — authorized team only.
        </p>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- lead row */

function LeadRow({
  lead,
  onSaved,
}: {
  lead: PortalLead
  onSaved: (l: PortalLead) => void
}) {
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
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer border-b border-ink/5 transition hover:bg-ink/[0.02]"
      >
        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink/50">{fmtDate(lead.created_at)}</td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${TYPE_STYLES[lead.type] || TYPE_STYLES.contact}`}>
            {lead.type}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="text-sm font-semibold text-ink">{lead.name}</div>
          <div className="text-xs text-ink/50">{lead.email}</div>
        </td>
        <td className="hidden max-w-xs truncate px-4 py-3 text-sm text-ink/60 lg:table-cell">
          {lead.message}
        </td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[lead.status]}`}>
            {lead.status}
          </span>
        </td>
        <td className="px-4 py-3 text-right text-ink/30">{open ? '▾' : '▸'}</td>
      </tr>

      {open && (
        <tr className="border-b border-ink/5 bg-ink/[0.02]">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Message</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm text-ink/80">
                  {lead.message}
                </p>
                <p className="mt-2 text-xs text-ink/40">
                  From page: {lead.page || '—'} · <a className="text-sky hover:underline" href={`mailto:${lead.email}`}>email {lead.name.split(' ')[0]}</a>
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                    Status
                    <select
                      value={lead.status}
                      disabled={busy}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => save({ status: e.target.value as LeadStatus })}
                      className="ml-2 rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-xs font-semibold text-ink normal-case"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </label>
                  {busy && <span className="text-xs text-ink/40">saving…</span>}
                </div>
                <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Internal notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    rows={3}
                    placeholder="Who followed up, what was said, next step…"
                    className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm normal-case text-ink outline-none focus:border-spark"
                  />
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      save({ notes })
                    }}
                    disabled={busy || notes === lead.notes}
                    className="rounded-lg bg-ink px-4 py-1.5 text-xs font-bold text-white transition hover:bg-ink-dark disabled:opacity-40"
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

/* -------------------------------------------------------------- dashboard */

function Dashboard({ user, onLogout }: { user: PortalUser; onLogout: () => void }) {
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
      setError(err instanceof Error ? err.message : 'Could not load leads.')
    } finally {
      setLoading(false)
    }
  }, [type, status, q])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

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
            <Logo dark />
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold sm:inline">
              Team portal
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/60">{user.name}</span>
            <a href="/" className="text-white/50 hover:text-white">View site</a>
            <button onClick={logout} className="rounded-lg bg-white/10 px-3 py-1.5 font-semibold hover:bg-white/20">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Leads</h1>
            <p className="mt-1 text-sm text-ink/50">
              {stats.total} shown · <span className="font-semibold text-spark">{stats.fresh} new</span>
            </p>
          </div>
          <a
            href="/api/portal/leads.csv"
            className="rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          >
            Export CSV
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, message…"
            className="min-w-56 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-spark"
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-flag-red/10 px-4 py-3 text-sm text-flag-red">{error}</p>
        )}

        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-ink/40">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Contact</th>
                <th className="hidden px-4 py-3 lg:table-cell">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <LeadRow key={l.id} lead={l} onSaved={saved} />
              ))}
              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink/40">
                    No leads match — when the site forms get submissions, they land here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && <p className="px-4 py-6 text-center text-sm text-ink/40">Loading…</p>}
        </div>
      </main>
    </div>
  )
}

/* ----------------------------------------------------------------- shell */

export function Portal() {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    portalApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-dark text-sm text-white/50">
        Loading…
      </div>
    )
  }
  return user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <LoginCard onLogin={setUser} />
}
