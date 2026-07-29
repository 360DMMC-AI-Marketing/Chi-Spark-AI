const LANES = [
  {
    n: '1',
    layer: 'Energy',
    jobs: 'Electricians · power & utility technicians · EV/solar installers',
    width: 'w-full',
    style: 'bg-ink-dark',
  },
  {
    n: '2',
    layer: 'Chips',
    jobs: 'Hardware & IT support technicians · device repair · fab operators',
    width: 'w-[92%]',
    style: 'bg-ink',
  },
  {
    n: '3',
    layer: 'Infrastructure',
    jobs: 'Data-center technicians · network installers · cooling & facilities',
    width: 'w-[84%]',
    style: 'bg-teal',
  },
  {
    n: '4',
    layer: 'Models',
    jobs: 'AI operators · prompt & workflow specialists · junior AI engineers',
    width: 'w-[76%]',
    style: 'bg-sky',
  },
  {
    n: '5',
    layer: 'Applications',
    jobs: 'AI-augmented roles in every industry · founders of AI ventures',
    width: 'w-[68%]',
    style: 'bg-spark',
  },
]

export function FiveLayers() {
  return (
    <section id="lanes" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            The Jobs Map
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Five layers of AI,{' '}
            <span className="font-serif-italic text-spark">five career lanes</span>
          </h2>
          <p className="mt-5 text-lg text-fg/70">
            NVIDIA CEO Jensen Huang calls AI "a five-layer cake" — energy, chips, infrastructure,
            models, applications — and the largest infrastructure buildout in human history. Every
            layer hires. Most youth programs prepare kids for one slice of it. We teach the whole
            cake, starting in high school.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-5">
          <div className="flex flex-col gap-2 lg:col-span-3">
            {[...LANES].reverse().map((l) => (
              <div key={l.n} className={`${l.width} rounded-xl px-5 py-4 text-white ${l.style}`}>
                <span className="text-sm font-bold">
                  {l.n} · {l.layer}
                </span>
                <span className="mt-0.5 hidden text-xs text-white/75 sm:block">{l.jobs}</span>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-fg">Why it matters</h3>
            <ul className="mt-5 space-y-4">
              {[
                'The buildout creates trade careers — electricians, technicians, builders — not just software jobs.',
                'A teen who can test all five lanes by 17 chooses a career with eyes open — while exploration is free.',
                'Every lane has a real on-ramp: apprenticeships, credentials, internships, or our own Incubator.',
              ].map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-fg/75">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-spark" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-7 rounded-xl border-l-4 border-spark bg-paper p-5 text-sm italic text-fg/70">
              "The question isn't whether the AI economy will need workers at every layer — it's
              whose kids will be ready for it."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
