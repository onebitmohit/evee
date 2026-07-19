import { schedules, task } from "@trigger.dev/sdk";
import { env } from "../src/config/env";
import { createTelegramBot } from "../src/bot/bot";
import { sendPendingAlerts } from "../src/bot/notifications";
import { getUser, listActiveUsers } from "../src/db/repository";
import { monitorUser } from "../src/services/monitor";

export const monitorUserTask = task({
  id: "monitor-user-opportunities",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 60_000,
    randomize: true,
  },
  queue: { concurrencyLimit: 8 },
  run: async (payload: { userId: string }) => {
    const result = await monitorUser(payload.userId);
    const user = await getUser(payload.userId);
    let alertsSent = 0;
    if (user && env.TELEGRAM_BOT_TOKEN) {
      alertsSent = await sendPendingAlerts(createTelegramBot(env.TELEGRAM_BOT_TOKEN), user);
    }
    return { ...result, alertsSent };
  },
});

export const monitorAllTask = schedules.task({
  id: "schedule-opportunity-monitoring",
  cron: "*/20 * * * *",
  ttl: "15m",
  run: async () => {
    const activeUsers = await listActiveUsers();
    if (!activeUsers.length) return { queued: 0 };
    const batch = await monitorUserTask.batchTrigger(activeUsers.map((user) => ({
      payload: { userId: user.id },
      options: {
        idempotencyKey: `monitor:${user.id}:${Math.floor(Date.now() / 1_200_000)}`,
        concurrencyKey: user.id,
      },
    })));
    return { queued: activeUsers.length, batchId: batch.batchId };
  },
});
