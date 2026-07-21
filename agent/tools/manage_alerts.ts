import { getUser, updateUserPreferences } from "@evee/platform/db/repository";
import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Pause or resume workspace monitoring alerts after an explicit user request.",
  inputSchema: z.object({ enabled: z.boolean().describe("True to resume alerts; false to pause alerts.") }),
  async execute({ enabled }, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");

    await updateUserPreferences(workspace.runtimeUser.id, { alertsEnabled: enabled });
    const user = await getUser(workspace.runtimeUser.id);
    return { alertsEnabled: user?.alertsEnabled ?? enabled };
  },
});
