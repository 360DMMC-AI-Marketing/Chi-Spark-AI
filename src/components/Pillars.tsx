const PILLARS = [
  {
    n: '01',
    title: 'Workforce',
    desc: 'Industry-recognized certifications, resume and portfolio building, interview practice, and warm hand-offs into jobs.',
    className: 'bg-ink-dark text-white',
    numClass: 'text-white/20',
    descClass: 'text-white/85',
  },
  {
    n: '02',
    title: 'Training',
    desc: 'LLM fundamentals, AI engineering, robotics and physical computing, data literacy, and AI security & safety — in cohorts with mentors.',
    className: 'bg-ink text-sky',
    numClass: 'text-sky/30',
    descClass: 'text-sky/85',
  },
  {
    n: '03',
    title: 'Entrepreneurship',
    desc: 'Idea validation, business fundamentals, mentorship, and a path from prototype to registered venture.',
    className: 'bg-spark text-white',
    numClass: 'text-white/30',
    descClass: 'text-white/85',
  },
  {
    n: '04',
    title: 'Innovation',
    desc: "Fresh curriculum, new tools tracked — building things that didn't exist before.",
    className: 'bg-flag-red text-white',
    numClass: 'text-white/25',
    descClass: 'text-white/85',
  },
]

export function Pillars() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            The System
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Four pillars, <span className="font-serif-italic text-spark">one spark</span>
          </h2>
          <p className="mt-5 text-lg text-fg/70">
            Every activity, across both tracks, is designed to advance at least one of four
            pillars.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.n} className={`rounded-2xl p-8 ${p.className}`}>
              <div className={`text-5xl font-extrabold ${p.numClass}`}>{p.n}</div>
              <h3 className="mt-3 text-xl font-bold">{p.title}</h3>
              <p className={`mt-2 ${p.descClass}`}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
