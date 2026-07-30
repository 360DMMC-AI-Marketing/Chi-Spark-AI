const UNITS = [
  {
    n: '01',
    title: 'Power & the data center',
    desc: 'What a data center actually is — how it is powered, cooled, and networked, and why Chicago is building them fast.',
    layers: ['Layer 1', 'Layer 3'],
  },
  {
    n: '02',
    title: 'Circuits & power basics',
    desc: 'The physics underneath everything: voltage, current, and safe hands-on practice with our STEM partners.',
    layers: ['Layer 1'],
  },
  {
    n: '03',
    title: 'Hardware build & teardown labs',
    desc: 'Build, break, and fix real devices — the tactile confidence that separates operators from spectators.',
    layers: ['Layer 2'],
  },
  {
    n: '04',
    title: 'Networking, cloud & AI operations',
    desc: 'How models are served at scale: networks, cloud fundamentals, and the day-to-day of AI operations.',
    layers: ['Layer 3', 'Layer 4'],
  },
  {
    n: '05',
    title: 'Directing models & shipping apps',
    desc: 'LLM literacy through real products — prompt, evaluate, fact-check, and ship an AI application of your own.',
    layers: ['Layer 4', 'Layer 5'],
  },
]

const GATES = ['Idea validation', 'Prototype sprint', 'Pilot build', 'Pitch & showcase']

export function Curriculum() {
  return (
    <section id="curriculum" className="relative overflow-hidden bg-ink py-24 text-white">
      <img
        src="/images/chicago-rooftops.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            Inside the Skills Track
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Five units, from the power up
          </h2>
          <p className="mt-5 text-lg text-white/70">
            The curriculum walks the full stack of the AI economy — starting with the electricity
            and ending with shipped applications. Ethics and durable skills run through every unit,
            and each cohort ends with a public showcase.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <ol className="space-y-8 lg:col-span-2">
            {UNITS.map((u) => (
              <li key={u.n} className="flex gap-5">
                <span className="font-serif-italic text-2xl text-spark">{u.n}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="text-lg font-bold">{u.title}</h3>
                    {u.layers.map((l) => (
                      <span
                        key={l}
                        className="rounded-full border border-sky/40 bg-sky/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-white/70">{u.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              Then: the Incubator
            </span>
            <h3 className="mt-3 text-xl font-bold">Stage gates, not grades</h3>
            <ol className="mt-5 space-y-3">
              {GATES.map((g, i) => (
                <li key={g} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-spark text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {g}
                </li>
              ))}
            </ol>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-white/70">
              <p>
                <strong className="text-white">Priority admission</strong> for AI Skills Track
                graduates — the high-school track feeds straight in.
              </p>
              <p>
                <strong className="text-white">Participants own their work.</strong> If a project
                becomes a registered business, a modest 2–8% stake comes back to fund the next
                cohort — never to any individual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
