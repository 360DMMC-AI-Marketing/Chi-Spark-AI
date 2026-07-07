import sparkMark from '../assets/spark-mark.png'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink pt-32 pb-24 text-white sm:pt-40 sm:pb-32">
      <img
        src={sparkMark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-10 h-[26rem] w-auto opacity-[0.07] sm:h-[34rem]"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal/60 bg-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky">
          Nonprofit AI Incubator · Chicagoland
        </span>

        <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          Build the thing you couldn't get{' '}
          <span className="font-serif-italic text-spark">hired</span> to build.
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg text-white/80 sm:text-xl">
          Chi-Spark AI equips underserved Chicagoland teens and young adults with fluency in
          modern AI — from large language models to AI engineering and robotics — alongside
          durable work habits and a real path to a job or a venture of their own.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#programs"
            className="w-full rounded-full bg-spark px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-spark/20 transition-transform hover:scale-105 sm:w-auto"
          >
            See the programs
          </a>
          <a
            href="#get-involved"
            className="w-full rounded-full border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Get involved
          </a>
        </div>

        <p className="mt-10 text-xs text-white/40">
          "Chi-Spark AI" is a working name, pending trademark &amp; availability check · est.
          Chicagoland, 2026
        </p>
      </div>
    </section>
  )
}
