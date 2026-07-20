import { AppShell } from "@/components/app-shell";
import { requireWorkspace } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, workspace } = await requireWorkspace();
  return <AppShell workspaceName={workspace.name} userName={session.user.name} userEmail={session.user.email}>{children}</AppShell>;
}
