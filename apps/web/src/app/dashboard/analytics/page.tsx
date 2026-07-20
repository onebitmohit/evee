import { listOpportunitiesForUser } from "@evee/platform/db/repository";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import { HorizontalMeter, MiniBars, ScoreRing } from "@/components/metric-visuals";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const { runtimeUser } = await requireWorkspace();
  const opportunities = await listOpportunitiesForUser(runtimeUser.id, 500);
  const bySource = opportunities.reduce<Record<string, number>>((totals, item) => {
    totals[item.candidate.source] = (totals[item.candidate.source] ?? 0) + 1;
    return totals;
  }, {});
  const outcomes = {
    saved: opportunities.filter((item) => item.status === "saved").length,
    replied: opportunities.filter((item) => item.status === "replied").length,
    dismissed: opportunities.filter((item) => item.status === "dismissed").length,
  };
  const average = opportunities.length ? Math.round(opportunities.reduce((total, item) => total + item.score, 0) / opportunities.length) : 0;
  const maximumSource = Math.max(...Object.values(bySource), 1);
  const maximumOutcome = Math.max(...Object.values(outcomes), 1);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const end = date.getTime() + 24 * 60 * 60 * 1_000;
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: opportunities.filter((item) => item.createdAt >= date.getTime() && item.createdAt < end).length,
    };
  });

  return (
    <div className="grid gap-5">
      <PageHeader title="Analytics" description="Opportunity quality, source contribution, and feedback from real workspace activity." />

      <section className="grid overflow-hidden rounded-[10px] border bg-[var(--surface)] md:grid-cols-4">
        {[
          { label: "Qualified", value: opportunities.length, detail: "All captured opportunities", visual: <MiniBars values={days.map((day) => day.count)} label="Qualified opportunities over seven days" /> },
          { label: "Average score", value: average || "-", detail: "Mean fit score", visual: <ScoreRing value={average} size={46} label="Average fit score" /> },
          { label: "Saved", value: outcomes.saved, detail: "Marked useful", visual: <div className="w-16 pb-1"><HorizontalMeter value={outcomes.saved} maximum={opportunities.length} label="Saved opportunities" /></div> },
          { label: "Replied", value: outcomes.replied, detail: "Team response recorded", visual: <div className="w-16 pb-1"><HorizontalMeter value={outcomes.replied} maximum={opportunities.length} label="Replied opportunities" /></div> },
        ].map((metric) => (
          <div key={metric.label} className="group min-w-0 border-r px-4 py-4 last:border-r-0 max-md:border-b max-md:border-r-0 max-md:last:border-b-0">
            <p className="text-[11px] font-medium text-[var(--text-muted)]">{metric.label}</p>
            <div className="mt-5 flex items-end justify-between gap-3"><div><p className="font-mono text-[30px] font-medium leading-none tracking-[-0.06em]">{metric.value}</p><p className="mt-2 text-[10px] text-[var(--text-faint)]">{metric.detail}</p></div>{metric.visual}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.55fr)]">
        <section className="rounded-[10px] border bg-[var(--surface)]">
          <div className="flex items-start justify-between border-b px-4 py-3.5"><div><h2 className="text-xs font-semibold">Source contribution</h2><p className="mt-0.5 text-[10px] text-[var(--text-faint)]">Qualified conversations by public source</p></div><p className="font-mono text-xl leading-none">{opportunities.length}</p></div>
          {Object.keys(bySource).length ? (
            <div className="grid min-h-64 grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4">
              {Object.entries(bySource).map(([source, count]) => (
                <div key={source} className="flex min-h-64 flex-col justify-end bg-[var(--surface)] px-4 pb-4 pt-8">
                  <div className="flex flex-1 items-end justify-center border-b border-dashed border-[var(--chart-grid)]"><div className="w-10 rounded-t-[4px] bg-[var(--text-muted)]" style={{ height: `${Math.max(5, Math.round((count / maximumSource) * 100))}%` }} /></div>
                  <div className="mt-3 flex items-end justify-between gap-2"><div><p className="font-mono text-xl leading-none">{count}</p><p className="mt-1 font-mono text-[8px] uppercase text-[var(--text-faint)]">{source}</p></div><p className="font-mono text-[9px] text-[var(--text-faint)]">{Math.round((count / opportunities.length) * 100)}%</p></div>
                </div>
              ))}
            </div>
          ) : <div className="grid min-h-64 place-items-center text-center"><div><ChartLineUp size={22} className="mx-auto text-[var(--text-faint)]" /><p className="mt-3 text-xs text-[var(--text-muted)]">Source analytics appear after the first qualified opportunities.</p></div></div>}
        </section>

        <section className="rounded-[10px] border bg-[var(--surface)]">
          <div className="border-b px-4 py-3.5"><h2 className="text-xs font-semibold">Feedback outcomes</h2><p className="mt-0.5 text-[10px] text-[var(--text-faint)]">Signals used to improve later analysis</p></div>
          <div className="divide-y">
            {Object.entries(outcomes).map(([label, count], index) => (
              <div key={label} className="px-4 py-4"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs capitalize"><span className="font-mono text-[8px] text-[var(--text-faint)]">0{index + 1}</span>{label}</span><span className="font-mono text-lg leading-none">{count}</span></div><div className="mt-3"><HorizontalMeter value={count} maximum={maximumOutcome} label={`${label} feedback`} /></div></div>
            ))}
          </div>
          <p className="border-t px-4 py-3 text-[9px] leading-4 text-[var(--text-faint)]">Feedback is included in later analysis prompts so ranking and writing improve with real team decisions.</p>
        </section>
      </div>

      <section className="rounded-[10px] border bg-[var(--surface)]">
        <div className="flex items-start justify-between border-b px-4 py-3.5"><div><h2 className="text-xs font-semibold">Seven day volume</h2><p className="mt-0.5 text-[10px] text-[var(--text-faint)]">New qualified opportunities per day</p></div><p className="font-mono text-xl leading-none">{days.reduce((sum, day) => sum + day.count, 0)}</p></div>
        <div className="grid grid-cols-7 gap-2 px-4 py-5 sm:gap-4">
          {days.map((day) => {
            const maximum = Math.max(...days.map((item) => item.count), 1);
            return <div key={day.label} className="flex h-28 flex-col justify-end"><p className="mb-2 text-center font-mono text-[10px]">{day.count}</p><div className="mx-auto w-full max-w-12 rounded-t-[3px] bg-[var(--text-muted)]" style={{ height: `${Math.max(day.count ? 6 : 2, (day.count / maximum) * 76)}px`, opacity: day.count ? 0.85 : 0.15 }} /><p className="mt-2 text-center font-mono text-[8px] uppercase text-[var(--text-faint)]">{day.label}</p></div>;
          })}
        </div>
      </section>
    </div>
  );
}
