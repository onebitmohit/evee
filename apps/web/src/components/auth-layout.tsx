import { ChatsCircle, Crosshair, Lightning } from "@phosphor-icons/react/dist/ssr";
import { Brand } from "@/components/brand";

const notes = [
  { icon: Crosshair, title: "Find real demand", body: "Monitor public conversations for explicit pain, switching intent, and active buying signals." },
  { icon: Lightning, title: "Act while it matters", body: "Review evidence and personalized drafts from the web dashboard or Telegram." },
  { icon: ChatsCircle, title: "Learn from every decision", body: "Feedback improves opportunity ranking, monitor strategy, and reply style." },
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
      <section className="hidden border-r bg-[var(--surface-subtle)] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Brand />
        <div className="max-w-xl">
          <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent)]">GTM signal workspace</p>
          <h1 className="max-w-[10ch] text-5xl font-semibold leading-[0.98] tracking-[-0.055em] xl:text-6xl">Turn public demand into timely conversations.</h1>
          <div className="mt-12 grid max-w-lg gap-7">
            {notes.map((note) => (
              <div key={note.title} className="grid grid-cols-[32px_1fr] gap-4">
                <note.icon size={22} className="mt-0.5 text-[var(--accent)]" />
                <div><h2 className="text-sm font-semibold">{note.title}</h2><p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{note.body}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-[var(--text-faint)]">Drafts stay human-reviewed. Evee never posts on your behalf.</p>
      </section>
      <section className="flex items-center justify-center bg-[var(--background)] px-5 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <h2 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
