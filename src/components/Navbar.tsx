import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { href: '#programs', label: 'Programs' },
  { href: '#approach', label: 'Approach' },
  { href: '#about', label: 'About' },
  { href: '#get-involved', label: 'Get Involved' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? 'bg-paper/95 shadow-sm backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" aria-label="Chi-Spark AI home">
          <Logo variant={scrolled ? 'onLight' : 'onSky'} />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-spark ${
                scrolled ? 'text-fg/80' : 'text-sky/85'
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#get-involved"
            className="rounded-full bg-spark px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
          >
            Get Involved
          </a>
          <ThemeToggle scrolled={scrolled} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle scrolled={scrolled} />
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              scrolled ? 'text-fg' : 'text-sky'
            }`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
              />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span
                className={`absolute left-0 top-3 h-0.5 w-5 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-fg/10 bg-paper md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg hover:bg-fg/5"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#get-involved"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-spark px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Involved
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
