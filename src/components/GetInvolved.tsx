const WAYS = [
  {
    title: 'Mentor & volunteer',
    desc: "Chicago's tech workforce is our natural mentor pool. Share your skills with a cohort, one session or one semester at a time.",
    subject: 'Mentoring interest — Chi-Spark AI',
  },
  {
    title: 'Partner with us',
    desc: 'Schools, libraries, community centers, and employers: host a cohort, offer a hand-off pipeline, or hire our graduates.',
    subject: 'Partnership inquiry — Chi-Spark AI',
  },
  {
    title: 'Join the founding board',
    desc: "We're recruiting directors across nonprofit leadership, AI/tech, entrepreneurship, finance, fundraising, and legal.",
    subject: 'Founding board interest — Chi-Spark AI',
  },
  {
    title: 'Support the launch',
    desc: "We're in formation toward 501(c)(3) status via a fiscal sponsor. Founding supporters make the first pilot possible.",
    subject: 'Founding supporter — Chi-Spark AI',
  },
]

const CONTACT_EMAIL = 'hello@chisparkai.org'

export function GetInvolved() {
  return (
    <section id="get-involved" className="bg-ink py-24 text-sky">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            Get Involved
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Help us light the first spark
          </h2>
          <p className="mt-5 text-lg text-sky/80">
            This is a founding-stage effort. Whatever you bring — time, a classroom, a network, or
            early funding — helps us get the first pilot off the ground.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {WAYS.map((w) => (
            <a
              key={w.title}
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(w.subject)}`}
              className="group rounded-2xl border border-sky/15 bg-white/40 p-7 transition-colors hover:border-spark/50 hover:bg-white/60"
            >
              <h3 className="text-lg font-bold">{w.title}</h3>
              <p className="mt-2 text-sm text-sky/80">{w.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-spark">
                Reach out
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
