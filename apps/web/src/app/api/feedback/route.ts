import { recordOpportunityFeedback } from "@evee/platform/services/feedback";
import { feedbackValueSchema } from "@evee/platform/domain/types";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireWorkspace } from "@/lib/session";

const inputSchema = z.object({ opportunityId: z.string().uuid(), value: feedbackValueSchema.exclude(["rewrite"]), note: z.string().max(1_000).optional() });

export async function POST(request: Request) {
  const { runtimeUser } = await requireWorkspace();
  const input = inputSchema.parse(await request.json());
  await recordOpportunityFeedback(runtimeUser.id, input.opportunityId, input.value, input.note);
  return NextResponse.json({ ok: true });
}
