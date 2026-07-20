import { getTelegramConnection, listWorkspaceIntegrations } from "@evee/platform/db/workspaces";
import { Envelope, GithubLogo, RedditLogo, Rss, SlackLogo, TelegramLogo, XLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { TelegramLink } from "@/components/telegram-link";
import { requireWorkspace } from "@/lib/session";

const icons = { reddit: RedditLogo, github: GithubLogo, hackernews: Rss, rss: Rss, telegram: TelegramLogo, slack: SlackLogo, email: Envelope, x: XLogo };
const sourceTypes = new Set(["reddit", "github", "hackernews", "rss"]);

export const metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const { workspace } = await requireWorkspace();
  const [integrations, telegram] = await Promise.all([listWorkspaceIntegrations(workspace.id), getTelegramConnection(workspace.id)]);
  const sources = integrations.filter((integration) => sourceTypes.has(integration.type));
  const channels = integrations.filter((integration) => !sourceTypes.has(integration.type));
  const connected = integrations.filter((integration) => integration.status === "connected").length;

  const list = (items: typeof integrations) => (
    <div className="divide-y">
      {items.map((integration, index) => {
        const Icon = icons[integration.type];
        const source = sourceTypes.has(integration.type);
        return (
          <div key={integration.id} className="grid gap-3 px-4 py-3.5 sm:grid-cols-[28px_32px_minmax(0,1fr)_minmax(160px,auto)] sm:items-center">
            <span className="hidden font-mono text-[8px] text-[var(--text-faint)] sm:block">{String(index + 1).padStart(2, "0")}</span>
            <span className="grid size-8 place-items-center rounded-[7px] bg-[var(--surface-subtle)] text-[var(--text-muted)]"><Icon size={16} weight="fill" /></span>
            <div className="min-w-0"><div className="flex items-center gap-2"><h2 className="text-xs font-semibold">{integration.displayName}</h2><span className={`text-[8px] font-semibold ${integration.status === "connected" ? "text-[var(--success)]" : "text-[var(--text-faint)]"}`}>{integration.status === "connected" ? "Connected" : "Not connected"}</span></div><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">{integration.type === "telegram" ? "Instant alerts, reply drafts, quick feedback, and daily digests." : source ? "Public signal monitoring with workspace-scoped queries and filters." : integration.type === "x" ? "Available where your X API access supports the required endpoints." : "Optional notification and collaboration delivery channel."}</p></div>
            <div className="sm:text-right">{integration.type === "telegram" ? <TelegramLink initiallyConnected={Boolean(telegram)} username={telegram?.telegramUsername} /> : source ? <p className="text-[9px] text-[var(--text-faint)]">Managed in monitors</p> : <button disabled className="h-8 rounded-[7px] border px-3 text-[9px] font-semibold text-[var(--text-faint)]">Provider setup required</button>}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="grid gap-5">
      <PageHeader title="Integrations" description="Connect signal sources and delivery channels. Credentials and authorization stay outside the agent prompt." />
      <section className="grid overflow-hidden rounded-[10px] border bg-[var(--surface)] sm:grid-cols-3">{[["Available", integrations.length], ["Connected", connected], ["Delivery channels", channels.length]].map(([label, value]) => <div key={String(label)} className="border-r px-4 py-3.5 last:border-r-0 max-sm:border-b max-sm:border-r-0"><p className="text-[10px] text-[var(--text-faint)]">{label}</p><p className="mt-2 font-mono text-2xl leading-none tracking-[-0.05em]">{value}</p></div>)}</section>
      <section className="overflow-hidden rounded-[10px] border bg-[var(--surface)]"><div className="border-b px-4 py-3.5"><h2 className="text-xs font-semibold">Signal sources</h2><p className="mt-0.5 text-[10px] text-[var(--text-faint)]">Public surfaces used to find relevant conversations</p></div>{list(sources)}</section>
      <section className="overflow-hidden rounded-[10px] border bg-[var(--surface)]"><div className="border-b px-4 py-3.5"><h2 className="text-xs font-semibold">Delivery channels</h2><p className="mt-0.5 text-[10px] text-[var(--text-faint)]">Companion surfaces for alerts, digests, and team actions</p></div>{list(channels)}</section>
    </div>
  );
}
