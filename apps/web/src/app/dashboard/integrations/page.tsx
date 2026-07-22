import { getTelegramConnection } from "@evee/platform/db/workspaces";
import { ArrowRight, GithubLogo, RedditLogo, Rss, TelegramLogo } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TelegramLink } from "@/components/telegram-link";
import { requireWorkspace } from "@/lib/session";

const sources = [
  { label: "Reddit", icon: RedditLogo },
  { label: "Hacker News", icon: Rss },
  { label: "GitHub", icon: GithubLogo },
  { label: "RSS", icon: Rss },
];

export const metadata = { title: "Connections" };

export default async function ConnectionsPage() {
  const { workspace } = await requireWorkspace();
  const telegram = await getTelegramConnection(workspace.id);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Connections"
        description="Manage the signal sources and delivery channel that are available in Evee today."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section className="overflow-hidden rounded-[10px] border bg-[var(--surface)]">
          <div className="border-b px-4 py-3.5">
            <h2 className="text-xs font-semibold">Signal sources</h2>
            <p className="mt-0.5 text-[11px] text-[var(--text-faint)]">Sources available when creating a monitor</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4 xl:grid-cols-2">
            {sources.map((source) => (
              <div key={source.label} className="flex items-center gap-2.5 bg-[var(--surface)] px-4 py-4">
                <span className="grid size-8 place-items-center rounded-[8px] bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                  <source.icon size={16} weight="fill" />
                </span>
                <span className="text-[12px] font-medium">{source.label}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/monitors" className="group flex items-center justify-between border-t px-4 py-3 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
            Manage monitors
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        <section className="overflow-hidden rounded-[10px] border bg-[var(--surface)]">
          <div className="flex items-center gap-3 border-b px-4 py-3.5">
            <span className="grid size-8 place-items-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent)]">
              <TelegramLogo size={17} weight="fill" />
            </span>
            <div>
              <h2 className="text-xs font-semibold">Telegram companion</h2>
              <p className="mt-0.5 text-[11px] text-[var(--text-faint)]">Alerts, digests, feedback, and quick actions</p>
            </div>
          </div>
          <div className="p-4">
            <p className="mb-4 text-[12px] leading-5 text-[var(--text-muted)]">
              Link your Telegram account to receive qualified opportunities and work with the same Evee workspace away from the dashboard.
            </p>
            <TelegramLink initiallyConnected={Boolean(telegram)} username={telegram?.telegramUsername} />
          </div>
        </section>
      </div>
    </div>
  );
}
