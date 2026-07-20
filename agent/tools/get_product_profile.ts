import { defineTool } from "eve/tools";
import { z } from "zod";
import { getProfile } from "@evee/platform/db/repository";
import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";

export default defineTool({
  description: "Read a user's saved product, audience, pain points, competitors, keywords, exclusions, and preferred reply style.",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");
    const profile = await getProfile(workspace.runtimeUser.id);
    return profile ?? { error: "No saved product profile." };
  },
});
