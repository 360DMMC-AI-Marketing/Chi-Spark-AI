import { useState } from 'react'
import { LeadModal } from './LeadModal'
import type { LeadType } from '../lib/leads'

type Way = {
  title: string
  desc: string
  type: LeadType
  modalDesc: string
}

const WAYS: Way[] = [
  {
    title: 'Mentor & volunteer',
    desc: "Chicago's tech workforce is our natural mentor pool. Share your skills with a cohort, one session or one semester at a time.",
    type: 'mentor',
    modalDesc: 'Tell us your background, what you could teach, and roughly how much time you can give.',
  },
  {
    title: 'Partner with us',
    desc: 'Schools, libraries, community centers, and employers: host a cohort, offer a hand-off pipeline, or hire our graduates.',
    type: 'partner',
    modalDesc: 'Tell us about your organization and how you’d like to work together.',
  },
  {
    title: 'Join the founding board',
    desc: "We're recruiting directors across nonprofit leadership, AI/tech, entrepreneurship, finance, fundraising, and legal.",
    type: 'board',
    modalDesc: 'Tell us about your experience and what draws you to Chi-Spark AI.',
  },
  {
    title: 'Support the launch',
    desc: "We're in formation toward 501(c)(3) status via a fiscal sponsor. Founding supporters make the first pilot possible.",
    type: 'supporter',
    modalDesc: 'Tell us how you’d like to help fund the first pilot — we’ll follow up personally.',
  },
]

export function GetInvolved() {
  const [active, setActive] = useState<Way | null>(null)

  return (
    <section id="get-involved" className="bg-ink py-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            Get Involved
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Help us light the first spark
          </h2>
          <p className="mt-5 text-lg text-white/70">
            This is a founding-stage effort. Whatever you bring — time, a classroom, a network, or
            early funding — helps us get the first pilot off the ground.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {WAYS.map((w) => (
            <button
              key={w.title}
              onClick={() => setActive(w)}
              className="group rounded-2xl border border-white/10 bg-white/5 p-7 text-left transition-colors hover:border-spark/50 hover:bg-white/10"
            >
              <h3 className="text-lg font-bold">{w.title}</h3>
              <p className="mt-2 text-sm text-white/70">{w.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-spark">
                Reach out
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <LeadModal
        open={active !== null}
        onClose={() => setActive(null)}
        type={active?.type ?? 'contact'}
        title={active?.title ?? ''}
        desc={active?.modalDesc ?? ''}
      />
    </section>
  )
}
