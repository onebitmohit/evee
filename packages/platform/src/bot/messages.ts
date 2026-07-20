import { InlineKeyboard } from "grammy";
import type { StoredOpportunity } from "../domain/types";
import { escapeHtml, truncate } from "../utils/text";

const sourceNames = { reddit: "Reddit", hackernews: "Hacker News", github: "GitHub", rss: "RSS" } as const;

export function opportunityMessage(opportunity: StoredOpportunity) {
  const signals = opportunity.signals.length
    ? `\n\n<b>Signals</b>\n${opportunity.signals.map((signal) => `• ${escapeHtml(signal)}`).join("\n")}`
    : "";
  const risks = opportunity.risks.length
    ? `\n\n<b>Watch for</b> ${escapeHtml(opportunity.risks.join("; "))}`
    : "";
  return `<b>${opportunity.score}/100 opportunity · ${sourceNames[opportunity.candidate.source]}</b>
<b>${escapeHtml(truncate(opportunity.candidate.title, 240))}</b>

${escapeHtml(opportunity.reason)}${signals}${risks}

<b>Suggested reply</b>
${escapeHtml(truncate(opportunity.replyDraft, 1_800))}`;
}

export function opportunityKeyboard(opportunity: StoredOpportunity) {
  return new InlineKeyboard()
    .url("Open conversation ↗", opportunity.candidate.url).row()
    .text("👍 Useful", `fb:good:${opportunity.id}`)
    .text("👎 Not a fit", `fb:bad:${opportunity.id}`).row()
    .text("↻ Rewrite", `fb:rewrite:${opportunity.id}`)
    .text("✓ I replied", `fb:replied:${opportunity.id}`);
}

export function digestMessage(opportunities: StoredOpportunity[]) {
  const entries = opportunities.map((item, index) =>
    `<b>${index + 1}. ${item.score}/100 · ${sourceNames[item.candidate.source]}</b>\n` +
    `<a href="${escapeHtml(item.candidate.url)}">${escapeHtml(truncate(item.candidate.title, 140))}</a>\n` +
    `${escapeHtml(truncate(item.reason, 220))}`,
  );
  return `<b>Your opportunity digest</b>\n${opportunities.length} new conversation${opportunities.length === 1 ? "" : "s"} worth reviewing.\n\n${entries.join("\n\n")}`;
}
