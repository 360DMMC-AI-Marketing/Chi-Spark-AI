import { useState } from 'react'
import { LeadModal } from './LeadModal'

const TIERS = [
  {
    amount: '$250',
    name: 'Spark',
    desc: 'Fuels hardware kits, devices, and lab materials for hands-on units.',
  },
  {
    amount: '$1,000',
    name: 'Cohort',
    desc: 'Underwrites transit, meals, and stipends that remove barriers to showing up.',
  },
  {
    amount: '$5,000',
    name: 'Site',
    desc: 'Helps stand up a new community site — space, equipment, and instructor hours.',
  },
]

export function Support() {
  const [modal, setModal] = useState<{ title: string; prefill: string } | null>(null)

  const open = (title: string, prefill: string) => setModal({ title, prefill })

  return (
    <section id="support" className="bg-gradient-to-br from-spark to-orange-700 py-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-white/70">
            Founding Supporters
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Fuel the first spark
          </h2>
          <p className="mt-5 text-lg text-white/85">
            We operate under an established 501(c)(3) fiscal sponsor while our own exemption is
            pending — so founding gifts are tax-deductible today, and every dollar goes to the
            pilot: instructors, kits, and participant support.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TIERS.map((t) => (
            <button
              key={t.name}
              onClick={() =>
                open(
                  `${t.name} tier — ${t.amount}`,
                  `I'd like to pledge ${t.amount} as a founding supporter (${t.name} tier). Please follow up with next steps.`
                )
              }
              className="group rounded-2xl border border-white/25 bg-white/10 p-7 text-left transition-colors hover:border-white/60 hover:bg-white/20"
            >
              <div className="text-3xl font-bold">{t.amount}</div>
              <div className="mt-1 text-sm font-bold uppercase tracking-widest text-white/80">
                {t.name}
              </div>
              <p className="mt-3 text-sm text-white/75">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                Pledge {t.amount}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-white/75">
            In-kind gifts — devices, space, volunteer time — move the pilot just as much.
          </p>
          <button
            onClick={() =>
              open(
                'Custom or in-kind gift',
                "I'd like to support Chi-Spark AI with a custom or in-kind gift: "
              )
            }
            className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            Custom amount or in-kind →
          </button>
        </div>
      </div>

      <LeadModal
        open={modal !== null}
        onClose={() => setModal(null)}
        type="supporter"
        title={modal?.title ?? 'Support Chi-Spark AI'}
        desc="Leave your details and the founding team will follow up personally — no payment is taken on this site."
        prefill={modal?.prefill}
      />
    </section>
  )
}
