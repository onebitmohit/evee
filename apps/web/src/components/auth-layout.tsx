import { ChatsCircle, Crosshair, Lightning } from "@phosphor-icons/react/dist/ssr";
import { Brand } from "@/components/brand";

const notes = [
  { icon: Crosshair, number: "01", title: "Find real demand", body: "Monitor public conversations for explicit pain, switching intent, and active buying signals." },
  { icon: Lightning, number: "02", title: "Act while it matters", body: "Review evidence and personalized drafts from the web dashboard or Telegram." },
  { icon: ChatsCircle, number: "03", title: "Learn from decisions", body: "Feedback improves opportunity ranking, monitor strategy, and reply style." },
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] bg-[var(--background)] p-1.5 lg:grid-cols-[minmax(0,1.15fr)_minmax(400px,0.85fr)]">
      <section className="hidden overflow-hidden rounded-[12px] border bg-[var(--surface)] p-8 lg:flex lg:flex-col lg:justify-between xl:p-11">
        <Brand />
        <div className="my-12 max-w-2xl">
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--text-faint)]">GTM signal workspace</p>
          <h1 className="mt-5 max-w-[11ch] text-5xl font-semibold leading-[0.96] tracking-[-0.06em] xl:text-6xl">Public demand, organized for action.</h1>
          <div className="mt-10 grid overflow-hidden rounded-[10px] border sm:grid-cols-3">
            {[["04", "Public sources"], ["01", "Shared workspace"], ["00", "Auto-posts"]].map(([value, label]) => <div key={label} className="border-r p-4 last:border-r-0"><p className="font-mono text-2xl tracking-[-0.05em]">{value}</p><p className="mt-2 text-[9px] text-[var(--text-faint)]">{label}</p></div>)}
          </div>
          <div className="mt-8 grid gap-0 divide-y rounded-[10px] border">
            {notes.map((note) => (
              <div key={note.title} className="grid grid-cols-[24px_28px_1fr] gap-3 px-4 py-3.5">
                <span className="font-mono text-[8px] text-[var(--text-faint)]">{note.number}</span><note.icon size={16} className="text-[var(--text-muted)]" />
                <div><h2 className="text-xs font-semibold">{note.title}</h2><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">{note.body}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-faint)]">Drafts stay human-reviewed. Evee never posts on your behalf.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[390px]">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-faint)]">Secure workspace access</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">{title}</h2>
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
