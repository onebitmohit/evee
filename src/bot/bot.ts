import { Bot, type Context } from "grammy";
import { defaultRssFeeds } from "../config/env";
import {
  ensureTelegramUser,
  getProfile,
  getUser,
  provisionDefaultSources,
  saveProfile,
  setOnboarding,
  updateUserPreferences,
} from "../db/repository";
import { profileInputSchema, type ProfileInput } from "../domain/types";
import { recordOpportunityFeedback, rewriteOpportunity } from "../services/feedback";
import { monitorUser } from "../services/monitor";
import { escapeHtml, splitCommaList } from "../utils/text";
import { opportunityKeyboard, opportunityMessage } from "./messages";
import { sendDailyDigest, sendPendingAlerts } from "./notifications";

const questions: Record<string, string> = {
  product_name: "First, what is your product called?",
  product_url: "What is its URL? Send /skip if it is not public yet.",
  product_summary: "In 1–3 sentences, what does it do and what outcome does it create?",
  target_customers: "Who are the ideal customers? Separate segments with commas.",
  pain_points: "Which painful problems does it solve? Separate them with commas.",
  competitors: "Which alternatives or competitors do customers consider? Send comma-separated names, or /skip.",
  reply_style: "How should suggested replies sound? For example: concise, practical, friendly, no jargon.",
  keywords: "Which terms should I watch for? Send comma-separated phrases, or /skip to infer them.",
  exclusions: "Anything I should ignore? Examples: hiring posts, student projects, your own brand. Send /skip if none.",
};

const nextStep: Record<string, string> = {
  product_name: "product_url",
  product_url: "product_summary",
  product_summary: "target_customers",
  target_customers: "pain_points",
  pain_points: "competitors",
  competitors: "reply_style",
  reply_style: "keywords",
  keywords: "exclusions",
  exclusions: "complete",
};

export const telegramCommands = [
  { command: "start", description: "Start or resume onboarding" },
  { command: "setup", description: "Create or update your product profile" },
  { command: "profile", description: "View what the agent learned" },
  { command: "scan", description: "Scan public sources now" },
  { command: "digest", description: "Show your latest opportunity digest" },
  { command: "settings", description: "Configure digest time and score threshold" },
  { command: "pause", description: "Pause monitoring alerts" },
  { command: "resume", description: "Resume monitoring alerts" },
  { command: "skip", description: "Skip an optional onboarding question" },
  { command: "help", description: "Show all available commands" },
] as const;

async function userFromContext(ctx: Context) {
  if (!ctx.from || !ctx.chat) throw new Error("Telegram user and chat are required.");
  return ensureTelegramUser({
    telegramUserId: String(ctx.from.id),
    telegramChatId: String(ctx.chat.id),
    firstName: ctx.from.first_name,
    ...(ctx.from.username ? { username: ctx.from.username } : {}),
  });
}

function profileSummary(profile: Awaited<ReturnType<typeof getProfile>>) {
  if (!profile) return "No profile yet. Use /setup to create one.";
  return `<b>${escapeHtml(profile.productName)}</b>${profile.productUrl ? ` · ${escapeHtml(profile.productUrl)}` : ""}\n` +
    `${escapeHtml(profile.productSummary)}\n\n` +
    `<b>Customers:</b> ${escapeHtml(profile.targetCustomers.join(", "))}\n` +
    `<b>Pain points:</b> ${escapeHtml(profile.painPoints.join(", "))}\n` +
    `<b>Competitors:</b> ${escapeHtml(profile.competitors.join(", ") || "—")}\n` +
    `<b>Style:</b> ${escapeHtml(profile.replyStyle)}\n` +
    `<b>Keywords:</b> ${escapeHtml(profile.keywords.join(", ") || "inferred from profile")}\n` +
    `<b>Exclusions:</b> ${escapeHtml(profile.exclusions.join(", ") || "—")}`;
}

async function completeOnboarding(userId: string, data: Record<string, unknown>) {
  const input = profileInputSchema.parse({
    productName: data.product_name,
    productUrl: data.product_url,
    productSummary: data.product_summary,
    targetCustomers: data.target_customers,
    painPoints: data.pain_points,
    competitors: data.competitors ?? [],
    replyStyle: data.reply_style,
    keywords: data.keywords ?? [],
    exclusions: data.exclusions ?? [],
  } satisfies Record<string, unknown>) as ProfileInput;
  const profile = await saveProfile(userId, input);
  await provisionDefaultSources(userId, defaultRssFeeds);
  await setOnboarding(userId, "complete", {});
  return profile;
}

export function createTelegramBot(token: string) {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    const user = await userFromContext(ctx);
    const profile = await getProfile(user.id);
    if (profile) {
      await ctx.reply(`Welcome back. I’m monitoring public conversations for <b>${escapeHtml(profile.productName)}</b>.\n\nUse /scan for a scan or /help for controls.`, { parse_mode: "HTML" });
      return;
    }
    await setOnboarding(user.id, "product_name", {});
    await ctx.reply("I’ll learn your product, then look for public conversations where a genuinely useful reply can help. I never post on your behalf.");
    await ctx.reply(questions.product_name!);
  });

  bot.command("setup", async (ctx) => {
    const user = await userFromContext(ctx);
    await setOnboarding(user.id, "product_name", {});
    await ctx.reply(`Let’s ${await getProfile(user.id) ? "update" : "build"} your opportunity profile. ${questions.product_name}`);
  });

  bot.command("skip", async (ctx) => {
    const user = await userFromContext(ctx);
    const current = await getUser(user.id);
    if (!current || !["product_url", "competitors", "keywords", "exclusions"].includes(current.onboardingStep)) {
      await ctx.reply("This question is required, so I need an answer before continuing.");
      return;
    }
    const data = current.onboardingData;
    const step = nextStep[current.onboardingStep]!;
    if (step !== "complete") {
      await setOnboarding(user.id, step, data);
      await ctx.reply(questions[step]!);
      return;
    }
    try {
      const profile = await completeOnboarding(user.id, data);
      await ctx.reply(`Profile ready for <b>${escapeHtml(profile.productName)}</b>. I’ll score public conversations, explain the fit, and draft replies without ever posting for you.\n\nUse /scan for the first scan.`, { parse_mode: "HTML" });
    } catch (error) {
      await setOnboarding(user.id, "product_name", {});
      await ctx.reply(`I couldn’t save that profile (${error instanceof Error ? error.message : "invalid details"}). Let’s retry. ${questions.product_name}`);
    }
  });

  bot.command("profile", async (ctx) => {
    const user = await userFromContext(ctx);
    await ctx.reply(profileSummary(await getProfile(user.id)), { parse_mode: "HTML", link_preview_options: { is_disabled: true } });
  });

  bot.command("pause", async (ctx) => {
    const user = await userFromContext(ctx);
    await updateUserPreferences(user.id, { alertsEnabled: false });
    await ctx.reply("Monitoring alerts paused. Your profile and history are preserved. Use /resume when ready.");
  });

  bot.command("resume", async (ctx) => {
    const user = await userFromContext(ctx);
    await updateUserPreferences(user.id, { alertsEnabled: true });
    await ctx.reply("Monitoring alerts resumed.");
  });

  bot.command("settings", async (ctx) => {
    const user = await userFromContext(ctx);
    const input = ctx.match.trim();
    if (!input) {
      const current = await getUser(user.id);
      await ctx.reply(`Current settings: digest at ${current?.digestHour}:00 (${current?.timezone}), alert threshold ${current?.minScore}/100.\n\nUpdate with: /settings 9 Asia/Kolkata 70`);
      return;
    }
    const [hourRaw, timezone, scoreRaw] = input.split(/\s+/);
    const hour = Number(hourRaw);
    const score = Number(scoreRaw);
    if (!timezone || !Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(score) || score < 40 || score > 100) {
      await ctx.reply("Use: /settings <hour 0–23> <IANA timezone> <minimum score 40–100>\nExample: /settings 9 Asia/Kolkata 70");
      return;
    }
    try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format(); } catch {
      await ctx.reply("That timezone is not recognized. Use an IANA value such as Asia/Kolkata or America/New_York.");
      return;
    }
    await updateUserPreferences(user.id, { digestHour: hour, timezone, minScore: score });
    await ctx.reply(`Saved. Digest: ${hour}:00 ${timezone}; alert threshold: ${score}/100.`);
  });

  bot.command("scan", async (ctx) => {
    const user = await userFromContext(ctx);
    const profile = await getProfile(user.id);
    if (!profile) {
      const current = await getUser(user.id);
      const step = current?.onboardingStep && current.onboardingStep !== "complete"
        ? current.onboardingStep
        : "product_name";
      if (step === "product_name") await setOnboarding(user.id, step, current?.onboardingData ?? {});
      await ctx.reply(`Before I can scan, I need to finish learning your product.\n\n${questions[step] ?? questions.product_name}`);
      return;
    }
    await ctx.reply("Scanning Reddit, Hacker News, GitHub, and your RSS feeds now…");
    try {
      const result = await monitorUser(user.id);
      const fresh = await getUser(user.id);
      const sent = fresh ? await sendPendingAlerts(bot, fresh) : 0;
      await ctx.reply(`Scan complete: ${result.candidatesFound} conversations checked, ${result.opportunitiesCreated} qualified, ${sent} alert${sent === 1 ? "" : "s"} sent.${result.errors.length ? `\n${result.errors.length} source${result.errors.length === 1 ? "" : "s"} had temporary errors and will retry later.` : ""}`);
    } catch (error) {
      await ctx.reply(`The scan could not finish: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  bot.command("digest", async (ctx) => {
    const user = await userFromContext(ctx);
    await sendDailyDigest(bot, user, true);
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(`<b>Signal Scout controls</b>\n/start — begin\n/setup — rebuild product profile\n/profile — view what I learned\n/scan — scan now\n/digest — show current digest\n/settings — digest time and score threshold\n/pause · /resume — control alerts\n\nUse the buttons under each alert to teach me what is useful. I only draft replies; I never post them.`, { parse_mode: "HTML" });
  });

  bot.callbackQuery(/^fb:(good|bad|replied):(.+)$/, async (ctx) => {
    const user = await userFromContext(ctx);
    const match = ctx.match;
    await recordOpportunityFeedback(user.id, match[2]!, match[1] as "good" | "bad" | "replied");
    await ctx.answerCallbackQuery(match[1] === "good" ? "Saved as useful" : match[1] === "replied" ? "Nice—marked replied" : "Saved as not a fit");
  });

  bot.callbackQuery(/^fb:rewrite:(.+)$/, async (ctx) => {
    const user = await userFromContext(ctx);
    await ctx.answerCallbackQuery("Rewriting…");
    const draft = await rewriteOpportunity(user.id, ctx.match[1]!);
    const opportunity = await import("../db/repository").then(({ getOpportunity }) => getOpportunity(ctx.match[1]!));
    if (opportunity) {
      await ctx.editMessageText(opportunityMessage({ ...opportunity, replyDraft: draft }), {
        parse_mode: "HTML",
        reply_markup: opportunityKeyboard({ ...opportunity, replyDraft: draft }),
        link_preview_options: { is_disabled: true },
      });
    }
  });

  bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;
    const user = await userFromContext(ctx);
    const current = await getUser(user.id);
    if (!current || current.onboardingStep === "complete") {
      await ctx.reply("Use /scan to look now, /profile to see what I know, or /help for all controls.");
      return;
    }
    const step = current.onboardingStep;
    const value = ctx.message.text.trim();
    if (!value) return;
    const data = { ...current.onboardingData };
    if (["target_customers", "pain_points", "competitors", "keywords", "exclusions"].includes(step)) data[step] = splitCommaList(value);
    else data[step] = value;

    const following = nextStep[step];
    if (!following) return;
    if (following !== "complete") {
      await setOnboarding(user.id, following, data);
      await ctx.reply(questions[following]!);
      return;
    }

    try {
      const profile = await completeOnboarding(user.id, data);
      await ctx.reply(`Profile ready for <b>${escapeHtml(profile.productName)}</b>. I’ll score public conversations, explain the fit, and draft replies without ever posting for you.\n\nUse /scan for the first scan.`, { parse_mode: "HTML" });
    } catch (error) {
      await setOnboarding(user.id, "product_name", {});
      await ctx.reply(`I couldn’t save that profile (${error instanceof Error ? error.message : "invalid details"}). Let’s retry. ${questions.product_name}`);
    }
  });

  bot.catch((error) => console.error("Telegram update failed", error.error));
  return bot;
}
