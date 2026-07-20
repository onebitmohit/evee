import { listSourcesForUser } from "@evee/platform/db/repository";
import { ArrowRight, Crosshair, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";
import { addMonitor, toggleMonitor } from "./actions";

export const metadata = { title: "Monitors" };

export default async function MonitorsPage() {
  const { runtimeUser } = await requireWorkspace();
  const monitors = await listSourcesForUser(runtimeUser.id);
  return (
    <div className="grid gap-7">
      <PageHeader title="Monitors" description="Define where Evee searches and what signals matter. The copilot can also turn a plain-English goal into a focused monitor." actions={<Link href="/dashboard/agents" className="flex h-9 items-center gap-2 rounded-[9px] border bg-[var(--surface)] px-3.5 text-xs font-semibold hover:border-[var(--border-strong)]">Build with AI <ArrowRight size={14} /></Link>} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <section className="rounded-[14px] border bg-[var(--surface)]">
          <div className="border-b px-5 py-4"><h2 className="text-sm font-semibold">Source monitors</h2><p className="mt-1 text-xs text-[var(--text-faint)]">Enabled monitors are scanned by Trigger.dev schedules.</p></div>
          {monitors.length ? <div className="divide-y">{monitors.map((monitor) => (
            <div key={monitor.id} className="flex items-center gap-4 px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--surface-subtle)] text-[var(--accent)]"><Crosshair size={17} /></span>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-medium">{monitor.name}</p><span className="font-mono text-[9px] uppercase text-[var(--text-faint)]">{monitor.type}</span></div><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{String(monitor.config.query ?? monitor.config.url ?? "Uses business profile keywords")}</p></div>
              <form action={toggleMonitor}><input type="hidden" name="sourceId" value={monitor.id} /><input type="hidden" name="enabled" value={String(!monitor.enabled)} /><button className={`rounded-[8px] px-2.5 py-1.5 text-[10px] font-semibold ${monitor.enabled ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]" : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"}`}>{monitor.enabled ? "Active" : "Paused"}</button></form>
            </div>
          ))}</div> : <div className="px-5 py-12 text-center"><Crosshair size={24} className="mx-auto text-[var(--text-faint)]" /><h3 className="mt-3 text-sm font-semibold">No monitors configured</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Add one manually or ask the copilot to build it.</p></div>}
        </section>
        <form action={addMonitor} className="h-fit rounded-[14px] border bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2"><Plus size={16} className="text-[var(--accent)]" /><h2 className="text-sm font-semibold">Add monitor</h2></div>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-xs font-semibold">Name<input name="name" required className="h-10 rounded-[9px] border bg-[var(--background)] px-3 text-sm font-normal" placeholder="Competitor alternatives" /></label>
            <label className="grid gap-2 text-xs font-semibold">Source<select name="type" className="h-10 rounded-[9px] border bg-[var(--background)] px-3 text-sm font-normal"><option value="reddit">Reddit</option><option value="hackernews">Hacker News</option><option value="github">GitHub</option><option value="rss">RSS</option></select></label>
            <label className="grid gap-2 text-xs font-semibold">Query or feed URL<textarea name="query" required className="min-h-24 rounded-[9px] border bg-[var(--background)] px-3 py-2.5 text-sm font-normal leading-5" placeholder="looking for an alternative to..." /></label>
            <button className="h-10 rounded-[9px] bg-[var(--accent)] text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] active:translate-y-px">Create monitor</button>
          </div>
        </form>
      </div>
    </div>
  );
}
