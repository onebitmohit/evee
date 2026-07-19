import { defineTool } from "eve/tools";
import { z } from "zod";
import { feedbackValueSchema } from "../../src/domain/types";
import { recordOpportunityFeedback } from "../../src/services/feedback";

export default defineTool({
  description: "Record a user's explicit feedback on an opportunity so future scoring and drafts improve.",
  inputSchema: z.object({
    userId: z.string().uuid(),
    opportunityId: z.string().uuid(),
    value: feedbackValueSchema.exclude(["rewrite"]),
    note: z.string().max(1_000).optional(),
  }),
  async execute({ userId, opportunityId, value, note }) {
    await recordOpportunityFeedback(userId, opportunityId, value, note);
    return { saved: true };
  },
});
