import { schedules } from "@trigger.dev/sdk";
import { createTelegramBot } from "@evee/platform/bot/bot";
import { sendDailyDigest } from "@evee/platform/bot/notifications";
import { env } from "@evee/platform/config/env";
import { listActiveUsers } from "@evee/platform/db/repository";

function localParts(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(timestamp);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { hour: Number(value("hour")), date: `${value("year")}-${value("month")}-${value("day")}` };
}

export const dailyDigestTask = schedules.task({
  id: "schedule-daily-telegram-digests",
  cron: "5 * * * *",
  ttl: "45m",
  retry: { maxAttempts: 4, factor: 2, minTimeoutInMs: 2_000, maxTimeoutInMs: 30_000, randomize: true },
  run: async () => {
    if (!env.TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is required to send digests.");
    const bot = createTelegramBot(env.TELEGRAM_BOT_TOKEN);
    const activeUsers = await listActiveUsers();
    let sent = 0;
    for (const user of activeUsers) {
      const localNow = localParts(Date.now(), user.timezone);
      const lastLocal = user.lastDigestAt ? localParts(user.lastDigestAt, user.timezone) : undefined;
      if (localNow.hour !== user.digestHour || lastLocal?.date === localNow.date) continue;
      sent += await sendDailyDigest(bot, user);
    }
    return { usersChecked: activeUsers.length, opportunitiesSent: sent };
  },
});
