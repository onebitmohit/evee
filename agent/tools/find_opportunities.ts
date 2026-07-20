import { defineTool } from "eve/tools";
import { z } from "zod";
import { getUnalertedOpportunities, getUser } from "@evee/platform/db/repository";
import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { monitorUser } from "@evee/platform/services/monitor";

export default defineTool({
  description: "Scan configured public sources for a user, analyze new conversations, and return the strongest unsent opportunities.",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");
    const userId = workspace.runtimeUser.id;
    const result = await monitorUser(userId);
    const user = await getUser(userId);
    const opportunities = await getUnalertedOpportunities(userId, user?.minScore ?? 65, 5);
    return { result, opportunities };
  },
});
