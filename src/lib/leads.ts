export type LeadType = 'mentor' | 'partner' | 'board' | 'supporter' | 'contact'

export async function submitLead(input: {
  type: LeadType
  name: string
  email: string
  message: string
  company?: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, page: window.location.hash || window.location.pathname }),
    })
    const data = await res.json().catch(() => ({ ok: false as const }))
    if (!res.ok) {
      return { ok: false, error: (data as { error?: string }).error || 'Something went wrong — please try again.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error — please check your connection and try again.' }
  }
}
