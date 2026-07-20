import { getProfile } from "@evee/platform/db/repository";
import { FloppyDisk } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/session";
import { saveBusinessProfile } from "./actions";

const inputClass = "h-10 w-full rounded-[9px] border bg-[var(--background)] px-3 text-sm placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2";
const textareaClass = "min-h-24 w-full resize-y rounded-[9px] border bg-[var(--background)] px-3 py-2.5 text-sm leading-6 placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2";

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-semibold">{label}{children}{helper && <span className="font-normal leading-5 text-[var(--text-faint)]">{helper}</span>}</label>;
}

export const metadata = { title: "Business profile" };

export default async function BusinessProfilePage() {
  const { runtimeUser } = await requireWorkspace();
  const profile = await getProfile(runtimeUser.id);
  return (
    <div className="grid gap-7">
      <PageHeader title="Business profile" description="This is the shared context used by monitors, opportunity scoring, reply drafts, Telegram, and the GTM copilot." />
      <form action={saveBusinessProfile} className="grid gap-6">
        <section className="rounded-[14px] border bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Product</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Product name"><input className={inputClass} name="productName" defaultValue={profile?.productName} required /></Field>
            <Field label="Product URL" helper="Optional if the product is not public yet."><input className={inputClass} type="url" name="productUrl" defaultValue={profile?.productUrl} placeholder="https://" /></Field>
            <div className="sm:col-span-2"><Field label="What it does" helper="Describe the customer outcome, not only the feature list."><textarea className={textareaClass} name="productSummary" defaultValue={profile?.productSummary} required minLength={10} /></Field></div>
          </div>
        </section>
        <section className="rounded-[14px] border bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Market context</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Target customers" helper="Comma-separated segments."><textarea className={textareaClass} name="targetCustomers" defaultValue={profile?.targetCustomers.join(", ")} required /></Field>
            <Field label="Pain points" helper="Comma-separated problems or blocked workflows."><textarea className={textareaClass} name="painPoints" defaultValue={profile?.painPoints.join(", ")} required /></Field>
            <Field label="Competitors" helper="Products, services, or manual alternatives."><textarea className={textareaClass} name="competitors" defaultValue={profile?.competitors.join(", ")} /></Field>
            <Field label="Keywords" helper="Terms the monitors should pay attention to."><textarea className={textareaClass} name="keywords" defaultValue={profile?.keywords.join(", ")} /></Field>
          </div>
        </section>
        <section className="rounded-[14px] border bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Agent behavior</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Preferred reply style"><textarea className={textareaClass} name="replyStyle" defaultValue={profile?.replyStyle ?? "Concise, practical, friendly, and transparent about affiliation."} required /></Field>
            <Field label="Exclusions" helper="Conversations the system should ignore."><textarea className={textareaClass} name="exclusions" defaultValue={profile?.exclusions.join(", ")} placeholder="Hiring posts, student projects" /></Field>
          </div>
        </section>
        <div className="flex justify-end"><button className="flex h-10 items-center gap-2 rounded-[9px] bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] active:translate-y-px"><FloppyDisk size={15} />Save profile</button></div>
      </form>
    </div>
  );
}
