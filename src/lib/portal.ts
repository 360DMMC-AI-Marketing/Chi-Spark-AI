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

export const portalApi = {
  me: () => call<{ ok: boolean; user: PortalUser }>('/api/auth/me'),
  login: (username: string, password: string) =>
    call<{ ok: boolean; user: PortalUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => call<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
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
