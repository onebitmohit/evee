# Signal Scout

A Telegram-first AI opportunity agent that learns a product and continuously finds public conversations where that product can genuinely help.

Signal Scout monitors Reddit, Hacker News, GitHub, and configurable RSS feeds. It filters and deduplicates conversations, scores high-intent opportunities with a structured AI workflow, explains the evidence, drafts a transparent personalized reply, sends Telegram alerts and daily digests, and uses button feedback to improve later ranking and writing.

It never posts public replies on a user's behalf.

## Stack

- Bun + TypeScript backend
- grammY Telegram bot (long polling locally, webhook-ready in production)
- Vercel Eve agent definition and typed tools
- Vercel AI SDK 7 structured outputs with Zod
- Turso/libSQL + Drizzle ORM
- Trigger.dev scheduled monitoring, fan-out jobs, retries, concurrency, and hourly digest dispatch

## How it works

1. The Telegram onboarding learns the product, URL, audience, pain points, competitors, reply style, keywords, and exclusions.
2. Trigger.dev fans out a monitoring job for each active user every 20 minutes.
3. Source collectors normalize public conversations into a shared model and deduplicate them in Turso.
4. A cheap lexical/intent prefilter limits AI work to plausible candidates.
5. AI SDK returns a Zod-validated analysis with intent, fit, urgency, specificity, reply-safety, confidence, evidence, risks, and a draft.
6. Opportunities over the user's threshold arrive in Telegram with source links and feedback controls.
7. `Useful`, `Not a fit`, `Rewrite`, and `I replied` feedback is saved and included in later analysis prompts.
8. Trigger.dev checks each user's local timezone hourly and sends one daily digest.

When `AI_GATEWAY_API_KEY` is absent, local scans use a deterministic scoring and drafting fallback. This makes collectors, storage, Telegram, and jobs testable before AI credentials are added.

## Setup

Prerequisites: Bun, Node.js 24+ for the Eve CLI, a Telegram bot token from BotFather, a Turso database (or local libSQL), a Vercel AI Gateway key, and a Trigger.dev project. The backend itself runs on Bun; Node 24 is only required by Eve's current development CLI.

```bash
bun install
cp .env.example .env
bun run db:migrate
```

Fill in `.env`:

```dotenv
TELEGRAM_BOT_TOKEN=...
BOT_MODE=polling
AI_GATEWAY_API_KEY=...
AI_MODEL=google/gemini-3.5-flash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=...
TRIGGER_SECRET_KEY=tr_dev_...
TRIGGER_PROJECT_REF=proj_...
```

For local-only storage, leave `TURSO_DATABASE_URL=file:local.db` and the auth token blank.

Start the Telegram bot and health server:

```bash
bun run bot
```

Then open the bot and send `/start`. Useful commands:

- `/setup` rebuilds the product profile.
- `/profile` shows what the agent learned.
- `/scan` immediately scans all enabled sources.
- `/digest` sends the current digest.
- `/settings 9 Asia/Kolkata 70` sets local digest hour, timezone, and alert threshold.
- `/pause` and `/resume` control automated alerts without deleting history.

## Telegram webhook deployment

Set `BOT_MODE=webhook`, expose `POST /telegram/webhook`, and configure Telegram with the same secret stored in `TELEGRAM_WEBHOOK_SECRET`. Requests are validated against Telegram's `X-Telegram-Bot-Api-Secret-Token` header.

The health endpoint is `GET /health`.

## Trigger.dev

Replace the placeholder project ref through `TRIGGER_PROJECT_REF`, then run:

```bash
bun run trigger:dev
```

Deploy jobs with:

```bash
bun run trigger:deploy
```

The tasks are:

- `schedule-opportunity-monitoring`: every 20 minutes; fans out per-user jobs.
- `monitor-user-opportunities`: per-user collection, analysis, storage, and Telegram alert dispatch with exponential retries.
- `schedule-daily-telegram-digests`: hourly timezone-aware digest check.

Trigger.dev dev schedules only fire while its local CLI is running.

## Eve

The Eve agent lives in [`agent/`](./agent) with safety and behavior instructions plus tools to read a product profile, run an opportunity scan, and record feedback.

```bash
bun run eve:dev
```

grammY owns the Telegram transport, while Eve supplies the portable agent definition/tool surface and AI SDK supplies the structured opportunity workflow used by background monitoring.

## RSS feeds

Set `DEFAULT_RSS_FEEDS` to comma-separated feed URLs before a user finishes onboarding. Each feed becomes a separate source for that user:

```dotenv
DEFAULT_RSS_FEEDS=https://example.com/feed.xml,https://another.example/rss
```

More source-management commands can be added on top of the existing `sources` table without changing the monitoring pipeline.

## Quality checks

```bash
bun run typecheck
bun test
```

The database schema is in `src/db/schema.ts`; generated migrations are committed under `drizzle/`.

## Production notes

- Add a GitHub token to increase search rate limits.
- Keep the Reddit user agent descriptive and identify the service accurately.
- AI output is treated as a recommendation, not an authorization to post.
- Public source content is explicitly marked untrusted in the model prompt to reduce prompt-injection risk.
- Source failures are isolated, recorded on monitor runs, and retried by Trigger.dev.
- Tune per-user thresholds and source queries before increasing scan frequency or AI volume.
