export type LeadStatus = 'new' | 'contacted' | 'closed'

export interface PortalLead {
  id: number
  type: string
  name: string
  email: string
  message: string
  page: string
  status: LeadStatus
  notes: string
  created_at: string
}

export interface PortalUser {
  username: string
  name: string
  role: string
  totpEnabled: boolean
}

export interface SessionInfo {
  current: boolean
  created_at: string
  expires_at: string
  ua: string
}

export interface ActivityEntry {
  event: string
  ip: string
  created_at: string
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

const post = <T>(path: string, body?: unknown) =>
  call<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) })

export const portalApi = {
  // auth
  me: () => call<{ ok: boolean; user: PortalUser; recoveryCodesLeft: number }>('/api/auth/me'),
  login: (username: string, password: string) =>
    post<{ ok: boolean; user?: PortalUser; totpRequired?: boolean; pending?: string }>(
      '/api/auth/login',
      { username, password },
    ),
  completeTotp: (pending: string, code: string) =>
    post<{ ok: boolean; user: PortalUser }>('/api/auth/totp', { pending, code }),
  logout: () => post<{ ok: boolean }>('/api/auth/logout'),
  forgot: (username: string, recoveryCode: string, next: string) =>
    post<{ ok: boolean }>('/api/auth/forgot', { username, recoveryCode, next }),
  changePassword: (current: string, next: string) =>
    post<{ ok: boolean }>('/api/auth/password', { current, next }),

  // 2fa
  totpSetup: (password: string) =>
    post<{ ok: boolean; secret: string; otpauth: string }>('/api/auth/totp/setup', { password }),
  totpEnable: (code: string) =>
    post<{ ok: boolean; recoveryCodes: string[] }>('/api/auth/totp/enable', { code }),
  totpDisable: (password: string, code: string) =>
    post<{ ok: boolean }>('/api/auth/totp/disable', { password, code }),
  regenRecoveryCodes: (password: string) =>
    post<{ ok: boolean; recoveryCodes: string[] }>('/api/auth/recovery-codes', { password }),

  // sessions & activity
  sessions: () => call<{ ok: boolean; sessions: SessionInfo[] }>('/api/auth/sessions'),
  revokeOtherSessions: () => post<{ ok: boolean }>('/api/auth/sessions/revoke-others'),
  activity: () => call<{ ok: boolean; activity: ActivityEntry[] }>('/api/auth/activity'),

  // admin
  adminUsers: () =>
    call<{ ok: boolean; users: { id: number; username: string; name: string; role: string; totp_enabled: number }[] }>(
      '/api/admin/users',
    ),
  adminReset: (username: string) =>
    post<{ ok: boolean; tempPassword: string; name: string }>('/api/admin/reset-password', { username }),

  // leads
  leads: (filters: { type?: string; status?: string; q?: string }) => {
    const params = new URLSearchParams()
    if (filters.type) params.set('type', filters.type)
    if (filters.status) params.set('status', filters.status)
    if (filters.q) params.set('q', filters.q)
    const qs = params.toString()
    return call<{ ok: boolean; leads: PortalLead[] }>(`/api/portal/leads${qs ? `?${qs}` : ''}`)
  },
  updateLead: (id: number, patch: { status?: LeadStatus; notes?: string }) =>
    call<{ ok: boolean; lead: PortalLead }>(`/api/portal/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
}
