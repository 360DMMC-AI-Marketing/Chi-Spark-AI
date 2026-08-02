import { LeadForm } from './LeadForm'

// Opens the Spark chat widget in AI voice mode (injected by the widget script)
const openVoiceChat = () => {
  const w = window as unknown as { __chiChatOpen?: (withVoice: boolean) => void }
  if (w.__chiChatOpen) w.__chiChatOpen(true)
}

export function Contact() {
  return (
    <section id="contact" className="bg-paper py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">Contact</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Say hello
          </h2>
          <p className="mt-5 text-lg text-fg/70">
            Questions, ideas, or an introduction to make? We'd love to hear from you.
          </p>
          <p className="mt-3 text-lg text-fg/70">
            Prefer to talk? Call us at{' '}
            <button
              type="button"
              onClick={openVoiceChat}
              className="font-semibold text-sky hover:underline"
            >
              (773) 917-0291
            </button>
            .
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-fg/10 bg-surface p-8 shadow-sm">
          <LeadForm type="contact" />
          <p className="mt-4 text-xs text-fg/50">
            Goes straight to the founding team — we read everything.
          </p>
        </div>
      </div>
    </section>
  )
}
