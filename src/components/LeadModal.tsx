import { useEffect } from 'react'
import { LeadForm } from './LeadForm'
import type { LeadType } from '../lib/leads'

type Props = {
  open: boolean
  onClose: () => void
  type: LeadType
  title: string
  desc: string
  prefill?: string
}

export function LeadModal({ open, onClose, type, title, desc, prefill }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-dark/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-fg/10 bg-surface p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-xl leading-none text-fg/40 transition-colors hover:text-fg"
        >
          ✕
        </button>
        <h3 className="pr-8 text-xl font-bold text-fg">{title}</h3>
        <p className="mt-1.5 text-sm text-fg/60">{desc}</p>
        <div className="mt-6">
          <LeadForm type={type} initialMessage={prefill} />
        </div>
      </div>
    </div>
  )
}
