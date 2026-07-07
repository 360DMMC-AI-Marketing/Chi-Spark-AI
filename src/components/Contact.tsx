import { useState } from 'react'

const CONTACT_EMAIL = 'hello@chisparkai.org'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message from ${name || 'website visitor'}`)
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="bg-paper py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-teal">Contact</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Say hello
          </h2>
          <p className="mt-5 text-lg text-ink/70">
            Questions, ideas, or an introduction to make? We'd love to hear from you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4 rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-ink/70">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-ink outline-none focus:border-spark"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-ink outline-none focus:border-spark"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium text-ink/70">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-ink outline-none focus:border-spark"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-spark px-8 py-3.5 text-base font-semibold text-white transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Send message
          </button>
          <p className="text-xs text-ink/50">
            Opens your email client, addressed to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </form>
      </div>
    </section>
  )
}
