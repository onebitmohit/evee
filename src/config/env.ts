import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
);

const schema = z.object({
  TELEGRAM_BOT_TOKEN: optionalString,
  TELEGRAM_WEBHOOK_SECRET: optionalString,
  BOT_MODE: z.enum(["polling", "webhook"]).default("polling"),
  PORT: z.coerce.number().int().positive().default(3000),
  AI_GATEWAY_API_KEY: optionalString,
  AI_MODEL: z.string().default("google/gemini-3.5-flash"),
  TURSO_DATABASE_URL: z.string().default("file:local.db"),
  TURSO_AUTH_TOKEN: optionalString,
  GITHUB_TOKEN: optionalString,
  REDDIT_USER_AGENT: z.string().default("signal-scout/0.1 (opportunity monitoring bot)"),
  TRIGGER_SECRET_KEY: optionalString,
  TRIGGER_PROJECT_REF: optionalString,
  DEFAULT_RSS_FEEDS: z.string().default(""),
});

export const env = schema.parse(process.env);

export const defaultRssFeeds = env.DEFAULT_RSS_FEEDS.split(",")
  .map((feed) => feed.trim())
  .filter(Boolean);
