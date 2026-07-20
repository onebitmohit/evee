import { ArrowRight, ChartLineUp, Crosshair, PaperPlaneTilt, Target } from "@phosphor-icons/react/dist/ssr";
import { getProfile, listOpportunitiesForUser } from "@evee/platform/db/repository";
import { getWorkspaceDashboard, getTelegramConnection } from "@evee/platform/db/workspaces";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Target }) {
  return (
    <div className="min-w-0 border-r px-5 py-4 last:border-r-0 max-md:border-b max-md:border-r-0 max-md:last:border-b-0">
      <div className="flex items-center justify-between"><p className="text-xs font-medium text-[var(--text-muted)]">{label}</p><Icon size={16} className="text-[var(--text-faint)]" /></div>
      <p className="mt-4 font-mono text-3xl font-semibold tracking-[-0.05em]">{value}</p>
      <p className="mt-1 text-[11px] text-[var(--text-faint)]">{detail}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const { runtimeUser, workspace } = await requireWorkspace();
  const [stats, opportunities, profile, telegram] = await Promise.all([
    getWorkspaceDashboard(runtimeUser.id),
    listOpportunitiesForUser(runtimeUser.id, 5),
    getProfile(runtimeUser.id),
    getTelegramConnection(workspace.id),
  ]);

  return (
    <div className="grid gap-7">
      <PageHeader title="Overview" description="Your live GTM signal across monitors, opportunities, and connected delivery channels." actions={
        <Link href="/dashboard/agents" className="flex h-9 items-center gap-2 rounded-[9px] bg-[var(--accent)] px-3.5 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] active:translate-y-px">Ask copilot <ArrowRight size={14} /></Link>
      } />

      <section className="grid overflow-hidden rounded-[14px] border bg-[var(--surface)] shadow-[var(--shadow)] md:grid-cols-4">
        <Metric label="Opportunities" value={stats.opportunities} detail="Found in the last 7 days" icon={Target} />
        <Metric label="Average score" value={stats.averageScore || "-"} detail="Across recent opportunities" icon={ChartLineUp} />
        <Metric label="Active monitors" value={stats.activeMonitors} detail="Scanning connected sources" icon={Crosshair} />
        <Metric label="Replies sent" value={stats.replied} detail="Marked as replied this week" icon={PaperPlaneTilt} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.7fr)]">
        <section className="rounded-[14px] border bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="text-sm font-semibold">Latest opportunities</h2><p className="mt-0.5 text-xs text-[var(--text-faint)]">Ranked by recency and fit</p></div><Link className="text-xs font-medium text-[var(--accent)] hover:underline" href="/dashboard/opportunities">View all</Link></div>
          {opportunities.length ? (
            <div className="divide-y">
              {opportunities.map((opportunity) => (
                <Link href="/dashboard/opportunities" key={opportunity.id} className="grid gap-3 px-5 py-4 transition hover:bg-[var(--surface-subtle)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-[10px] uppercase text-[var(--text-faint)]">{opportunity.candidate.source}</span><span className="text-[10px] text-[var(--text-faint)]">{new Date(opportunity.createdAt).toLocaleDateString()}</span></div><p className="mt-1 truncate text-sm font-medium">{opportunity.candidate.title}</p><p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">{opportunity.reason}</p></div>
                  <span className="font-mono text-lg font-semibold text-[var(--accent)]">{opportunity.score}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center"><Target size={24} className="mx-auto text-[var(--text-faint)]" /><h3 className="mt-3 text-sm font-semibold">No opportunities yet</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--text-muted)]">Complete the business profile, review your monitors, then ask the copilot to run a focused scan.</p><Link href={profile ? "/dashboard/monitors" : "/dashboard/business"} className="mt-4 inline-flex text-xs font-semibold text-[var(--accent)] hover:underline">{profile ? "Review monitors" : "Create business profile"}</Link></div>
          )}
        </section>

        <section className="rounded-[14px] border bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Workspace readiness</h2>
          <div className="mt-5 grid gap-4">
            {[
              { label: "Business profile", ready: Boolean(profile), href: "/dashboard/business" },
              { label: "Source monitors", ready: stats.activeMonitors > 0, href: "/dashboard/monitors" },
              { label: "Telegram companion", ready: Boolean(telegram), href: "/dashboard/integrations" },
            ].map((item) => (
              <Link href={item.href} key={item.label} className="flex items-center justify-between gap-3 rounded-[10px] bg-[var(--surface-subtle)] px-3.5 py-3 hover:bg-[var(--surface-strong)]">
                <span className="text-xs font-medium">{item.label}</span>
                <span className={`text-[10px] font-semibold ${item.ready ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>{item.ready ? "Ready" : "Set up"}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
