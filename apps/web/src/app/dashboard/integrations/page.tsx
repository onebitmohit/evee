import { getTelegramConnection, listWorkspaceIntegrations } from "@evee/platform/db/workspaces";
import { Envelope, GithubLogo, RedditLogo, Rss, SlackLogo, TelegramLogo, XLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { TelegramLink } from "@/components/telegram-link";
import { requireWorkspace } from "@/lib/session";

const icons = { reddit: RedditLogo, github: GithubLogo, hackernews: Rss, rss: Rss, telegram: TelegramLogo, slack: SlackLogo, email: Envelope, x: XLogo };

export const metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const { workspace } = await requireWorkspace();
  const [integrations, telegram] = await Promise.all([listWorkspaceIntegrations(workspace.id), getTelegramConnection(workspace.id)]);
  return (
    <div className="grid gap-7">
      <PageHeader title="Integrations" description="Connect signal sources and delivery channels. Credentials and authorization stay outside the agent prompt." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = icons[integration.type];
          const source = ["reddit", "github", "hackernews", "rss"].includes(integration.type);
          return <section key={integration.id} className={`rounded-[14px] border bg-[var(--surface)] p-5 ${integration.type === "telegram" ? "md:col-span-2 xl:col-span-1" : ""}`}><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-[11px] bg-[var(--surface-subtle)] text-[var(--text-muted)]"><Icon size={20} weight="fill" /></span><span className={`text-[10px] font-semibold ${integration.status === "connected" ? "text-[var(--success)]" : "text-[var(--text-faint)]"}`}>{integration.status === "connected" ? "Connected" : "Not connected"}</span></div><h2 className="mt-4 text-sm font-semibold">{integration.displayName}</h2><p className="mt-1 min-h-10 text-xs leading-5 text-[var(--text-muted)]">{integration.type === "telegram" ? "Instant alerts, reply drafts, quick feedback actions, and daily digests." : source ? "Public signal monitoring with workspace-scoped queries and filters." : integration.type === "x" ? "Available only where your X API access level supports the required endpoints." : "Optional notification and collaboration delivery channel."}</p><div className="mt-4">{integration.type === "telegram" ? <TelegramLink initiallyConnected={Boolean(telegram)} username={telegram?.telegramUsername} /> : source ? <p className="text-[10px] text-[var(--text-faint)]">Configured through workspace monitors</p> : <button disabled className="h-9 w-full rounded-[9px] border text-xs font-semibold text-[var(--text-faint)]">Connect in provider setup</button>}</div></section>;
        })}
      </div>
    </div>
  );
}
