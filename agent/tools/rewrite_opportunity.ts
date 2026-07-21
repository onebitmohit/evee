import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { rewriteOpportunity } from "@evee/platform/services/feedback";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Rewrite an opportunity's reply draft with the user's explicit direction, while preserving the saved product profile and disclosure rules.",
  inputSchema: z.object({
    opportunityId: z.string().uuid(),
    instruction: z.string().min(2).max(1_000).optional(),
  }),
  async execute({ opportunityId, instruction }, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");
    const replyDraft = await rewriteOpportunity(workspace.runtimeUser.id, opportunityId, instruction);
    return { opportunityId, replyDraft };
  },
});
