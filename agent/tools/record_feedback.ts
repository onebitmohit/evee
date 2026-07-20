import { defineTool } from "eve/tools";
import { z } from "zod";
import { feedbackValueSchema } from "@evee/platform/domain/types";
import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { recordOpportunityFeedback } from "@evee/platform/services/feedback";

export default defineTool({
  description: "Record a user's explicit feedback on an opportunity so future scoring and drafts improve.",
  inputSchema: z.object({
    opportunityId: z.string().uuid(),
    value: feedbackValueSchema.exclude(["rewrite"]),
    note: z.string().max(1_000).optional(),
  }),
  async execute({ opportunityId, value, note }, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");
    await recordOpportunityFeedback(workspace.runtimeUser.id, opportunityId, value, note);
    return { saved: true };
  },
});
