import { AgentChat } from "@/components/agent-chat";
import { AppShell } from "@/components/app-shell";

export default function CopilotPreviewPage() {
  return (
    <AppShell workspaceName="Evee workspace" userName="Mohit" userEmail="mohit@example.com">
      <AgentChat />
    </AppShell>
  );
}
