import { getUser, listOpportunitiesForUser } from "@evee/platform/db/repository";
import { getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Read the workspace's latest qualified opportunities as a concise digest. This does not mark the Telegram digest as sent.",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const authUserId = ctx.session.auth.current?.principalId;
    if (!authUserId) throw new Error("A signed-in workspace is required.");
    const workspace = await getWorkspaceForAuthUser(authUserId);
    if (!workspace) throw new Error("No workspace is available for this account.");

    const user = await getUser(workspace.runtimeUser.id);
    const minimumScore = user?.minScore ?? 65;
    const opportunities = (await listOpportunitiesForUser(workspace.runtimeUser.id, 30))
      .filter((opportunity) => opportunity.relevant && opportunity.score >= minimumScore)
      .slice(0, 8)
      .map((opportunity) => ({
        id: opportunity.id,
        title: opportunity.candidate.title,
        source: opportunity.candidate.source,
        url: opportunity.candidate.url,
        score: opportunity.score,
        reason: opportunity.reason,
        signals: opportunity.signals,
        replyDraft: opportunity.replyDraft,
        status: opportunity.status,
        createdAt: opportunity.createdAt,
      }));

    return { minimumScore, count: opportunities.length, opportunities };
  },
});
