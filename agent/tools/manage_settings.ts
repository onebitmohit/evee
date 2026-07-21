import { getUser, updateUserPreferences } from "@evee/platform/db/repository";
import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { defineTool } from "eve/tools";
import { z } from "zod";

const inputSchema = z.object({
  digestHour: z.number().int().min(0).max(23).optional(),
  timezone: z.string().min(1).optional(),
  minScore: z.number().int().min(40).max(100).optional(),
});

export default defineTool({
  description: "Read notification settings, or update digest hour, IANA timezone, and minimum opportunity score after an explicit user request. With no values, only read settings.",
  inputSchema,
  async execute(input, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");

    if (input.timezone) {
      try {
        new Intl.DateTimeFormat("en", { timeZone: input.timezone }).format();
      } catch {
        throw new Error("Use a valid IANA timezone such as Asia/Kolkata or America/New_York.");
      }
    }

    if (Object.keys(input).length) await updateUserPreferences(workspace.runtimeUser.id, input);
    const user = await getUser(workspace.runtimeUser.id);
    if (!user) throw new Error("Workspace settings could not be loaded.");
    return {
      alertsEnabled: user.alertsEnabled,
      digestHour: user.digestHour,
      timezone: user.timezone,
      minScore: user.minScore,
    };
  },
});
