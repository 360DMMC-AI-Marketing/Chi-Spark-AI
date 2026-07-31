import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="bg-ink-dark py-12 text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <a href="/" aria-label="Chi-Spark AI home" className="transition-opacity hover:opacity-80">
          <Logo dark />
        </a>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <a href="#programs" className="hover:text-white">Programs</a>
          <a href="#approach" className="hover:text-white">Approach</a>
          <a href="#about" className="hover:text-white">About</a>
          <a href="#get-involved" className="hover:text-white">Get Involved</a>
          <a href="#contact" className="hover:text-white">Contact</a>
          <a href="/portal" className="text-white/35 hover:text-white">Team login</a>
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-6 pt-6 text-center text-xs text-white/40 sm:text-left">
        <p>
          © {new Date().getFullYear()} Chi-Spark AI · Chicagoland, IL. "Chi-Spark AI" is a
          working name pending trademark &amp; availability check. A project in formation toward
          501(c)(3) status.
        </p>
      </div>
    </footer>
  )
}
