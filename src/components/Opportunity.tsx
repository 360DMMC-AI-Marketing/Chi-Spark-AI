const STATS = [
  {
    value: '21%',
    label: 'of Chicago households',
    detail: 'still have no home internet connection at all.',
  },
  {
    value: '~40%',
    label: 'disconnected in the hardest-hit areas',
    detail: "in Chicago's least-connected community areas.",
  },
  {
    value: '$36K',
    label: 'vs. $69K median income',
    detail: 'disconnected households earn about half of connected peers.',
  },
  {
    value: '100K+',
    label: 'CPS students already connected',
    detail: 'through Chicago Connected — real progress, still a gap.',
  },
]

export function Opportunity() {
  return (
    <section id="opportunity" className="bg-paper py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            The Opportunity
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            A widening AI divide, on top of a digital divide
          </h2>
          <p className="mt-5 text-lg text-fg/70">
            Chicago has made real progress closing its connectivity gap. But AI is opening a new
            one — and owning a device isn't the same as knowing how to use AI to learn, create,
            and earn.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-fg/10 bg-surface p-6 shadow-sm">
              <div className="text-4xl font-extrabold tracking-tight text-spark">{s.value}</div>
              <div className="mt-3 text-sm font-semibold text-fg">{s.label}</div>
              <div className="mt-1.5 text-sm text-fg/60">{s.detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-ink px-8 py-10 text-center sm:px-16">
          <p className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
            "Owning a device is not the same as knowing how to use AI to learn, create, and{' '}
            <span className="font-serif-italic text-spark">earn</span>."
          </p>
        </div>
      </div>
    </section>
  )
}
