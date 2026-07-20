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
    <div className="grid gap-7">
      <PageHeader title="AI agents" description="Your Eve-powered copilot plans searches, builds monitors, researches context, explains relevance, and learns from feedback." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_300px]">
        <AgentChat />
        <aside className="h-fit rounded-[14px] border bg-[var(--surface)] p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">Active agent</p><h2 className="mt-3 text-base font-semibold">{active?.name ?? "GTM Copilot"}</h2><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{active?.description ?? "Workspace research and opportunity analysis."}</p><dl className="mt-5 grid gap-3 border-t pt-4 text-xs"><div className="flex justify-between"><dt className="text-[var(--text-faint)]">Model</dt><dd className="font-mono">{active?.model ?? "gemini-2.5-flash"}</dd></div><div className="flex justify-between"><dt className="text-[var(--text-faint)]">Runtime</dt><dd>Vercel Eve</dd></div><div className="flex justify-between"><dt className="text-[var(--text-faint)]">Status</dt><dd className="text-[var(--success)]">{active?.status ?? "active"}</dd></div></dl></aside>
      </div>
    </div>
  );
}
