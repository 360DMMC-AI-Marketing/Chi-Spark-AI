const POINTS = [
  {
    title: 'AI-native, not retrofitted',
    desc: 'We start from directing and evaluating large language models — not traditional syntax-heavy coding. Code is a tool in service of building, not a gatekeeper.',
  },
  {
    title: 'Broad by design',
    desc: 'Generative AI, the foundations of AI engineering, and hands-on robotics — so participants discover which lane excites them.',
  },
  {
    title: 'Five layers, from the power up',
    desc: 'Students learn what a data center is and how it is powered, cooled, and networked; build, tear down, and troubleshoot hardware in hands-on labs; and study circuits and power basics — before directing models and shipping applications.',
  },
  {
    title: 'Project- and portfolio-based',
    desc: 'Every participant leaves with things they made and can show — the most persuasive asset in an interview, application, or pitch.',
  },
  {
    title: 'Incubator, not classroom',
    desc: 'For our older track especially: mentorship, workspace, and resources in exchange for structured participation, not a school format.',
  },
  {
    title: 'Durable skills, taught explicitly',
    desc: 'Attendance, deadlines, professional communication, and collaboration — because employers rank these alongside technical ability.',
  },
  {
    title: 'Ethics and safety throughout',
    desc: 'Bias, privacy, misinformation, and responsible use are integrated into every cohort, not bolted on at the end.',
  },
]

export function Approach() {
  return (
    <section id="approach" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">
            The Approach
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Built, not decorated
          </h2>
          <p className="mt-5 text-lg text-fg/70">
            No stock circuit boards, no generic bootcamp curriculum. What makes the program
            distinctive:
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title}>
              <div className="h-1 w-10 rounded-full bg-spark" />
              <h3 className="mt-4 text-lg font-bold text-fg">{p.title}</h3>
              <p className="mt-2 text-fg/65">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-sky/20 bg-sky/5 p-8 sm:p-10">
          <h3 className="text-xl font-bold text-fg">
            Ownership over charity
          </h3>
          <p className="mt-3 max-w-3xl text-fg/75">
            Participants own what they create in Chi-Spark AI programming, full stop — free to use
            it in portfolios, applications, and interviews. If an Incubator participant turns a
            project into a registered business, we negotiate a modest equity stake (roughly
            2–8%, only upon commercialization) in recognition of the mentorship and resources
            invested. Every dollar of that goes back into programming — not to any individual.
          </p>
        </div>
      </div>
    </section>
  )
}
