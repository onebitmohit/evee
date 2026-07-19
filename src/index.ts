import { webhookCallback } from "grammy";
import { env } from "./config/env";
import { createTelegramBot, telegramCommands } from "./bot/bot";

const bot = env.TELEGRAM_BOT_TOKEN ? createTelegramBot(env.TELEGRAM_BOT_TOKEN) : undefined;
const webhook = bot && env.BOT_MODE === "webhook" ? webhookCallback(bot, "bun") : undefined;

if (bot) {
  try {
    await bot.api.setMyCommands(telegramCommands);
  } catch (error) {
    console.error("Could not register Telegram command menu", error);
  }
}

if (bot && env.BOT_MODE === "polling") {
  void bot.start({
    onStart: ({ username }) => console.log(`Telegram bot @${username} started with long polling.`),
  });
}

const server = Bun.serve({
  port: env.PORT,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        telegramConfigured: Boolean(bot),
        botMode: env.BOT_MODE,
        geminiConfigured: Boolean(env.GEMINI_API_KEY),
        timestamp: new Date().toISOString(),
      });
    }
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      if (!webhook) return new Response("Telegram is not configured", { status: 503 });
      if (env.TELEGRAM_WEBHOOK_SECRET) {
        const supplied = request.headers.get("x-telegram-bot-api-secret-token");
        if (supplied !== env.TELEGRAM_WEBHOOK_SECRET) return new Response("Unauthorized", { status: 401 });
      }
      return webhook(request);
    }
    return new Response("Signal Scout", { status: 200 });
  },
});

console.log(`Signal Scout listening on http://localhost:${server.port}`);
if (!bot) console.warn("TELEGRAM_BOT_TOKEN is not set; health server only.");
