import { listOpportunitiesForUser } from "@evee/platform/db/repository";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const { runtimeUser } = await requireWorkspace();
  const opportunities = await listOpportunitiesForUser(runtimeUser.id, 500);
  const bySource = opportunities.reduce<Record<string, number>>((totals, item) => { totals[item.candidate.source] = (totals[item.candidate.source] ?? 0) + 1; return totals; }, {});
  const outcomes = { saved: opportunities.filter((item) => item.status === "saved").length, replied: opportunities.filter((item) => item.status === "replied").length, dismissed: opportunities.filter((item) => item.status === "dismissed").length };
  const average = opportunities.length ? Math.round(opportunities.reduce((total, item) => total + item.score, 0) / opportunities.length) : 0;
  return (
    <div className="grid gap-7">
      <PageHeader title="Analytics" description="Measure opportunity quality, source contribution, and the feedback loop using real workspace activity." />
      <section className="grid overflow-hidden rounded-[14px] border bg-[var(--surface)] md:grid-cols-4">{[
        ["Qualified", opportunities.length], ["Average score", average || "-"], ["Saved", outcomes.saved], ["Replied", outcomes.replied],
      ].map(([label, value]) => <div key={String(label)} className="border-r p-5 last:border-r-0 max-md:border-b max-md:border-r-0"><p className="text-xs text-[var(--text-muted)]">{label}</p><p className="mt-4 font-mono text-3xl font-semibold tracking-[-0.05em]">{value}</p></div>)}</section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[14px] border bg-[var(--surface)] p-5"><h2 className="text-sm font-semibold">Source contribution</h2>{Object.keys(bySource).length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{Object.entries(bySource).map(([source, count]) => <div key={source} className="rounded-[10px] bg-[var(--surface-subtle)] p-4"><p className="font-mono text-2xl font-semibold">{count}</p><p className="mt-1 text-[10px] uppercase text-[var(--text-faint)]">{source}</p></div>)}</div> : <div className="py-12 text-center"><ChartLineUp size={24} className="mx-auto text-[var(--text-faint)]" /><p className="mt-3 text-xs text-[var(--text-muted)]">Source analytics appear after the first qualified opportunities.</p></div>}</section>
        <section className="rounded-[14px] border bg-[var(--surface)] p-5"><h2 className="text-sm font-semibold">Feedback outcomes</h2><div className="mt-5 grid gap-3">{Object.entries(outcomes).map(([label, count]) => <div key={label} className="flex items-center justify-between rounded-[10px] bg-[var(--surface-subtle)] px-4 py-3"><span className="text-xs capitalize text-[var(--text-muted)]">{label}</span><span className="font-mono text-sm font-semibold">{count}</span></div>)}</div><p className="mt-4 text-[10px] leading-4 text-[var(--text-faint)]">Feedback is included in later analysis prompts so ranking and writing improve with real team decisions.</p></section>
      </div>
    </div>
  );
}
