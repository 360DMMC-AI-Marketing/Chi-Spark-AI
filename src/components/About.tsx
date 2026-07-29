const VALUES = [
  'Opportunity over background',
  "Build, don't just consume",
  'Ownership, not just employment',
  'Work ethic is a skill',
  'Responsible by design',
  'Partnership over duplication',
  'Evidence and accountability',
]

const FOUNDERS = [
  { name: 'Dennis Cruz', role: 'Co-Founder' },
  { name: 'Edmil Amar', role: 'Co-Founder' },
]

export function About() {
  return (
    <section id="about" className="bg-paper py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sky">
              Mission &amp; Vision
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
              About Chi-Spark AI
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-fg/75">
              To equip underserved Chicagoland teens and young adults with fluency in modern AI
              technology — from large language models to AI engineering and robotics — alongside
              durable work habits and real-world exposure, so they can build careers or build
              their own ventures in the economy of the future.
            </p>
            <p className="mt-5 rounded-xl border-l-4 border-spark bg-surface/60 p-5 text-fg/70 italic">
              A Chicago where a young person's ZIP code no longer determines whether they can
              shape — rather than be displaced by — the technologies of their generation.
            </p>

            <div className="mt-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-fg/50">
                Founding team
              </h3>
              <div className="mt-4 flex flex-wrap gap-4">
                {FOUNDERS.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-3 rounded-xl border border-fg/10 bg-surface px-4 py-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                      {f.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-fg">{f.name}</div>
                      <div className="text-xs text-fg/50">{f.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-fg/60">
                We're actively recruiting a third co-founder and founding board members —
                nonprofit leadership, AI/tech, entrepreneurship, finance, fundraising, legal, and
                lived experience of the communities we serve.
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sky">
              Core Values
            </span>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-fg">
              How we make decisions
            </h3>
            <ul className="mt-6 space-y-3">
              {VALUES.map((v) => (
                <li
                  key={v}
                  className="flex items-center gap-3 rounded-xl border border-fg/10 bg-surface px-5 py-4 text-fg"
                >
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-spark" />
                  <span className="font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
