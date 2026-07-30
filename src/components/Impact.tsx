const STATS = [
  { value: '40–60', label: 'pilot participants in year one' },
  { value: '1–2', label: 'community sites at launch' },
  { value: '5', label: 'career lanes, from energy to applications' },
  { value: '$186K', label: 'year-one pilot budget — 43% to instructors & staff' },
]

export function Impact() {
  return (
    <section id="impact" className="bg-paper py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sky">
              Year One, by the Numbers
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
              A pilot built to be measured
            </h2>
          </div>
          <p className="text-sm text-fg/50">Targets from Business Plan v7.5 · July 2026</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border-l-2 border-spark pl-5">
              <div className="text-4xl font-bold tracking-tight text-fg sm:text-5xl">{s.value}</div>
              <div className="mt-2 text-sm text-fg/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
