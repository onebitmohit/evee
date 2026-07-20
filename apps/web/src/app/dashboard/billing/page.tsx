import { getWorkspaceSubscription } from "@evee/platform/db/workspaces";
import { Check, CreditCard } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const { workspace } = await requireWorkspace();
  const subscription = await getWorkspaceSubscription(workspace.id);
  return (
    <div className="grid gap-7">
      <PageHeader title="Billing" description="Plan state and usage are application-owned. The AI agent cannot modify subscriptions or initiate charges." />
      <section className="grid gap-6 rounded-[14px] border bg-[var(--surface)] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)]"><CreditCard size={19} /></span><div><p className="text-xs text-[var(--text-faint)]">Current plan</p><h2 className="text-lg font-semibold capitalize">{subscription?.plan ?? workspace.plan}</h2></div></div><div className="mt-6 grid gap-3 text-xs text-[var(--text-muted)]">{["Shared web and Telegram workspace", "Public source monitoring", "GTM Copilot with workspace tools", "Opportunity scoring and reply drafts"].map((feature) => <p key={feature} className="flex items-center gap-2"><Check size={14} className="text-[var(--success)]" />{feature}</p>)}</div></div>
        <div className="rounded-[11px] bg-[var(--surface-subtle)] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">Subscription state</p><dl className="mt-4 grid gap-3 text-xs"><div className="flex justify-between"><dt className="text-[var(--text-muted)]">Status</dt><dd className="font-medium capitalize text-[var(--success)]">{subscription?.status ?? "trialing"}</dd></div><div className="flex justify-between"><dt className="text-[var(--text-muted)]">Billing provider</dt><dd className="font-medium capitalize">{subscription?.provider ?? "manual"}</dd></div></dl><button disabled className="mt-5 h-9 w-full rounded-[9px] border bg-[var(--surface)] text-xs font-semibold text-[var(--text-faint)]">Checkout provider not configured</button></div>
      </section>
    </div>
  );
}
