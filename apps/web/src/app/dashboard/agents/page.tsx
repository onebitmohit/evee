import { listWorkspaceAgents } from "@evee/platform/db/workspaces";
import { AgentChat } from "@/components/agent-chat";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";

export const metadata = { title: "AI agents" };

export default async function AgentsPage() {
  const { workspace } = await requireWorkspace();
  const agents = await listWorkspaceAgents(workspace.id);
  const active = agents[0];
  return (
    <div className="grid gap-5">
      <PageHeader title="AI agents" description="Your Eve-powered copilot plans searches, builds monitors, researches context, explains relevance, and learns from feedback." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_290px]">
        <AgentChat />
        <aside className="h-fit overflow-hidden rounded-[10px] border bg-[var(--surface)]"><div className="border-b px-4 py-3.5"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">Active agent</p><div className="mt-3 flex items-end justify-between"><h2 className="text-sm font-semibold">{active?.name ?? "GTM Copilot"}</h2><p className="font-mono text-2xl leading-none">{agents.length}</p></div><p className="mt-2 text-[10px] leading-4 text-[var(--text-muted)]">{active?.description ?? "Workspace research and opportunity analysis."}</p></div><dl className="divide-y text-[10px]"><div className="flex justify-between px-4 py-3"><dt className="text-[var(--text-faint)]">Model</dt><dd className="font-mono">{active?.model ?? "gemini-2.5-flash"}</dd></div><div className="flex justify-between px-4 py-3"><dt className="text-[var(--text-faint)]">Runtime</dt><dd>Vercel Eve</dd></div><div className="flex justify-between px-4 py-3"><dt className="text-[var(--text-faint)]">Status</dt><dd className="text-[var(--success)]">{active?.status ?? "active"}</dd></div></dl></aside>
      </div>
    </div>
  );
}
