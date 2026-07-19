import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
);

const optionalPort = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().int().positive().default(3000),
);

const schema = z.object({
  TELEGRAM_BOT_TOKEN: optionalString,
  TELEGRAM_WEBHOOK_SECRET: optionalString,
  BOT_MODE: z.enum(["polling", "webhook"]).default("polling"),
  PORT: optionalPort,
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  TURSO_DATABASE_URL: z.string().default("file:local.db"),
  TURSO_AUTH_TOKEN: optionalString,
  GITHUB_TOKEN: optionalString,
  REDDIT_USER_AGENT: z.string().default("signal-scout/0.1 (opportunity monitoring bot)"),
  TRIGGER_SECRET_KEY: optionalString,
  TRIGGER_PROJECT_REF: optionalString,
  DEFAULT_RSS_FEEDS: z.string().default(""),
});

// Legacy variables allow an existing local setup to keep working while it is
// renamed to GEMINI_API_KEY and GEMINI_MODEL. Calls are made directly to Google.
export const env = schema.parse({
  ...process.env,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? process.env.AI_GATEWAY_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? process.env.AI_MODEL?.replace(/^google\//, ""),
});

export const defaultRssFeeds = env.DEFAULT_RSS_FEEDS.split(",")
  .map((feed) => feed.trim())
  .filter(Boolean);
