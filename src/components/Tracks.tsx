const TRACKS = [
  {
    eyebrow: 'Starts here · Ages 15–18 · In high school',
    title: 'AI Skills Track',
    desc: 'Our launch program. Teens rotate through all five career lanes — from circuits and hardware to LLMs and AI apps — then pick a direction.',
    bullets: [
      'Full-stack exposure: electronics, hardware, networks, LLMs, and AI applications',
      'Building and sharing real AI + robotics projects, plus AI ethics',
      'Work-readiness: communication, reliability, teamwork',
      'Resume and portfolio polish, interview practice',
      'Warm hand-offs to internships, trade pathways, employers, or post-secondary',
    ],
    style: 'bg-gradient-to-br from-ink to-ink-dark',
  },
  {
    eyebrow: 'Phase 2 · Ages 18+ · No upper limit',
    title: 'AI Incubator',
    desc: 'Mentorship, workspace, and venture-building — with priority admission for Skills Track graduates. Incubator-style, not a classroom.',
    bullets: [
      'Applied AI engineering & robotics projects with a venture lens',
      '1:1 and group mentorship, plus workspace access',
      'Idea validation and basic business fundamentals',
      'Project sprints culminating in a pitch or showcase',
      'Leave with a working prototype, portfolio, or venture plan',
    ],
    style: 'bg-gradient-to-br from-spark to-orange-700',
  },
]

export function Tracks() {
  return (
    <section id="programs" className="bg-paper py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            Two Tracks, One Flame
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            High school first, ventures next
          </h2>
          <p className="mt-5 text-lg text-fg/70">
            We launch with the Skills Track — high school is where the access gap is widest and
            where intervention changes trajectories most. The Incubator follows, fed by our own
            graduates. Every cohort touches all four pillars.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {TRACKS.map((t) => (
            <div key={t.title} className={`rounded-3xl p-9 text-white shadow-lg ${t.style}`}>
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                {t.eyebrow}
              </span>
              <h3 className="mt-3 text-2xl font-bold">{t.title}</h3>
              <p className="mt-2 text-white/85">{t.desc}</p>
              <ul className="mt-6 space-y-3">
                {t.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-white/90">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
