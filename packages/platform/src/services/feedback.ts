import { rewriteReply } from "../ai/analyzer";
import { getOpportunity, getProfile, saveFeedback, updateOpportunity } from "../db/repository";
import type { FeedbackValue } from "../domain/types";

export async function recordOpportunityFeedback(userId: string, opportunityId: string, value: FeedbackValue, note?: string) {
  const opportunity = await getOpportunity(opportunityId);
  if (!opportunity || opportunity.userId !== userId) throw new Error("Opportunity not found.");
  await saveFeedback({ userId, opportunityId, value, ...(note ? { note } : {}) });
  if (value === "good") await updateOpportunity(opportunityId, { status: "saved" });
  if (value === "dismiss" || value === "bad") await updateOpportunity(opportunityId, { status: "dismissed" });
  if (value === "replied") await updateOpportunity(opportunityId, { status: "replied" });
}

export async function rewriteOpportunity(userId: string, opportunityId: string, instruction?: string) {
  const [opportunity, profile] = await Promise.all([getOpportunity(opportunityId), getProfile(userId)]);
  if (!opportunity || opportunity.userId !== userId || !profile) throw new Error("Opportunity or profile not found.");
  const draft = await rewriteReply(opportunity.candidate, profile, opportunity.replyDraft, instruction);
  await updateOpportunity(opportunityId, { replyDraft: draft });
  await saveFeedback({ userId, opportunityId, value: "rewrite", ...(instruction ? { note: instruction } : {}), editedDraft: draft });
  return draft;
}
