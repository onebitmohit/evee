import type { Bot } from "grammy";
import { getUnalertedOpportunities, listDigestOpportunities, markAlerted, markDigestSent } from "../db/repository";
import type { UserRow } from "../db/repository";
import { digestMessage, opportunityKeyboard, opportunityMessage } from "./messages";

export async function sendPendingAlerts(bot: Bot, user: UserRow) {
  if (!user.alertsEnabled) return 0;
  const items = await getUnalertedOpportunities(user.id, user.minScore, 5);
  let sent = 0;
  for (const item of items) {
    await bot.api.sendMessage(user.telegramChatId, opportunityMessage(item), {
      parse_mode: "HTML",
      reply_markup: opportunityKeyboard(item),
      link_preview_options: { is_disabled: true },
    });
    await markAlerted(item.id);
    sent += 1;
  }
  return sent;
}

export async function sendDailyDigest(bot: Bot, user: UserRow, force = false) {
  const since = user.lastDigestAt ?? Date.now() - 24 * 60 * 60 * 1_000;
  const items = await listDigestOpportunities(user.id, since);
  if (!items.length) {
    if (force) await bot.api.sendMessage(user.telegramChatId, "No new qualified opportunities since your last digest.");
    return 0;
  }
  await bot.api.sendMessage(user.telegramChatId, digestMessage(items), {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
  await markDigestSent(user.id, items.map((item) => item.id));
  return items.length;
}
