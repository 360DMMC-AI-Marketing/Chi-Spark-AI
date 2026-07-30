import { useState } from 'react'
import { submitLead, type LeadType } from '../lib/leads'

const inputCls =
  'mt-1.5 w-full rounded-lg border border-fg/15 bg-paper px-4 py-2.5 text-fg outline-none focus:border-spark'

export function LeadForm({ type }: { type: LeadType }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('') // honeypot — humans never see this
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError('')
    const r = await submitLead({ type, name, email, message, company })
    if (r.ok) setState('sent')
    else {
      setState('error')
      setError(r.error || 'Something went wrong — please try again.')
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-xl border border-teal/30 bg-teal/10 p-6 text-center">
        <div className="text-lg font-bold text-teal">Message received — thank you!</div>
        <p className="mt-2 text-sm text-fg/70">
          We read every message personally. Expect a reply from the team within a few days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* honeypot: hidden from humans, irresistible to bots */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${type}-name`} className="text-sm font-medium text-fg/70">
            Name
          </label>
          <input
            id={`${type}-name`}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${type}-email`} className="text-sm font-medium text-fg/70">
            Email
          </label>
          <input
            id={`${type}-email`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${type}-message`} className="text-sm font-medium text-fg/70">
          Message
        </label>
        <textarea
          id={`${type}-message`}
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls}
        />
      </div>
      {state === 'error' && (
        <p className="rounded-lg border border-flag-red/30 bg-flag-red/10 px-4 py-2.5 text-sm text-flag-red">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full rounded-full bg-spark px-8 py-3.5 text-base font-semibold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {state === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
