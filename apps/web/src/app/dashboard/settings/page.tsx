import { FloppyDisk } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";
import { saveSettings } from "./actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { runtimeUser } = await requireWorkspace();
  return (
    <div className="grid gap-7">
      <PageHeader title="Settings" description="Control synchronized alert behavior for scheduled jobs, the web dashboard, and Telegram." />
      <form action={saveSettings} className="max-w-2xl rounded-[14px] border bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Notifications and scoring</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold">Timezone<input name="timezone" required defaultValue={runtimeUser.timezone} className="h-10 rounded-[9px] border bg-[var(--background)] px-3 text-sm font-normal" /></label>
          <label className="grid gap-2 text-xs font-semibold">Daily digest hour<input name="digestHour" type="number" min="0" max="23" required defaultValue={runtimeUser.digestHour} className="h-10 rounded-[9px] border bg-[var(--background)] px-3 text-sm font-normal" /></label>
          <label className="grid gap-2 text-xs font-semibold">Minimum opportunity score<input name="minScore" type="number" min="40" max="100" required defaultValue={runtimeUser.minScore} className="h-10 rounded-[9px] border bg-[var(--background)] px-3 text-sm font-normal" /><span className="font-normal leading-5 text-[var(--text-faint)]">Alerts below this score stay in the dashboard but are not pushed.</span></label>
          <label className="flex items-start gap-3 rounded-[10px] bg-[var(--surface-subtle)] p-3.5 text-xs"><input type="checkbox" name="alertsEnabled" defaultChecked={runtimeUser.alertsEnabled} className="mt-0.5 size-4 accent-[var(--accent)]" /><span><strong className="block font-semibold">Instant alerts</strong><span className="mt-1 block leading-5 text-[var(--text-muted)]">Allow Trigger.dev jobs to deliver qualified opportunities to connected channels.</span></span></label>
        </div>
        <div className="mt-6 flex justify-end"><button className="flex h-10 items-center gap-2 rounded-[9px] bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] active:translate-y-px"><FloppyDisk size={15} />Save settings</button></div>
      </form>
    </div>
  );
}
