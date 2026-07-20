import { FloppyDisk } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";
import { saveSettings } from "./actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { runtimeUser } = await requireWorkspace();
  return (
    <div className="grid gap-5">
      <PageHeader title="Settings" description="Control synchronized alert behavior for scheduled jobs, the web dashboard, and Telegram." />
      <form action={saveSettings} className="max-w-3xl overflow-hidden rounded-[10px] border bg-[var(--surface)]">
        <div className="border-b px-4 py-3.5"><h2 className="text-xs font-semibold">Notifications and scoring</h2><p className="mt-0.5 text-[10px] text-[var(--text-faint)]">Deterministic controls shared by web and Telegram</p></div>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[10px] font-semibold">Timezone<input name="timezone" required defaultValue={runtimeUser.timezone} className="h-9 rounded-[7px] border bg-[var(--background)] px-3 text-xs font-normal" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold">Daily digest hour<input name="digestHour" type="number" min="0" max="23" required defaultValue={runtimeUser.digestHour} className="h-9 rounded-[7px] border bg-[var(--background)] px-3 font-mono text-xs font-normal" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold">Minimum opportunity score<input name="minScore" type="number" min="40" max="100" required defaultValue={runtimeUser.minScore} className="h-9 rounded-[7px] border bg-[var(--background)] px-3 font-mono text-xs font-normal" /><span className="font-normal leading-4 text-[var(--text-faint)]">Alerts below this score stay in the dashboard but are not pushed.</span></label>
          <label className="flex items-start gap-3 rounded-[8px] bg-[var(--surface-subtle)] p-3 text-[10px]"><input type="checkbox" name="alertsEnabled" defaultChecked={runtimeUser.alertsEnabled} className="mt-0.5 size-3.5 accent-[var(--accent)]" /><span><strong className="block font-semibold">Instant alerts</strong><span className="mt-1 block leading-4 text-[var(--text-muted)]">Allow Trigger.dev jobs to deliver qualified opportunities to connected channels.</span></span></label>
        </div>
        <div className="flex justify-end border-t px-4 py-3"><button className="flex h-9 items-center gap-2 rounded-[7px] bg-[var(--accent)] px-3.5 text-[10px] font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] active:translate-y-px"><FloppyDisk size={14} />Save settings</button></div>
      </form>
    </div>
  );
}
