import { createMonitor } from "@evee/platform/db/repository";
import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { sourceTypeSchema } from "@evee/platform/domain/types";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Create a focused workspace monitor after translating the user's natural-language monitoring goal into a source and query configuration.",
  inputSchema: z.object({
    type: sourceTypeSchema,
    name: z.string().min(2).max(80),
    query: z.string().min(2).max(500),
    communities: z.array(z.string().min(1)).max(20).default([]),
    exclusions: z.array(z.string().min(1)).max(20).default([]),
  }),
  async execute(input, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");
    return createMonitor({
      userId: workspace.runtimeUser.id,
      type: input.type,
      name: input.name,
      config: { query: input.query, communities: input.communities, exclusions: input.exclusions },
    });
  },
});
