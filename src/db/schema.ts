import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  telegramUserId: text("telegram_user_id").notNull().unique(),
  telegramChatId: text("telegram_chat_id").notNull(),
  firstName: text("first_name"),
  username: text("username"),
  timezone: text("timezone").notNull().default("UTC"),
  digestHour: integer("digest_hour").notNull().default(9),
  minScore: integer("min_score").notNull().default(65),
  alertsEnabled: integer("alerts_enabled", { mode: "boolean" }).notNull().default(true),
  onboardingStep: text("onboarding_step").notNull().default("product_name"),
  onboardingData: text("onboarding_data", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
  lastDigestAt: integer("last_digest_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  productUrl: text("product_url"),
  productSummary: text("product_summary").notNull(),
  targetCustomers: text("target_customers", { mode: "json" }).$type<string[]>().notNull(),
  painPoints: text("pain_points", { mode: "json" }).$type<string[]>().notNull(),
  competitors: text("competitors", { mode: "json" }).$type<string[]>().notNull(),
  replyStyle: text("reply_style").notNull(),
  keywords: text("keywords", { mode: "json" }).$type<string[]>().notNull(),
  exclusions: text("exclusions", { mode: "json" }).$type<string[]>().notNull(),
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [uniqueIndex("profiles_user_id_unique").on(table.userId)]);

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["reddit", "hackernews", "github", "rss"] }).notNull(),
  name: text("name").notNull(),
  config: text("config", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  lastCheckedAt: integer("last_checked_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [index("sources_user_id_idx").on(table.userId)]);

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  source: text("source", { enum: ["reddit", "hackernews", "github", "rss"] }).notNull(),
  externalId: text("external_id").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  author: text("author"),
  publishedAt: integer("published_at"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("conversations_source_external_unique").on(table.source, table.externalId)]);

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  relevant: integer("relevant", { mode: "boolean" }).notNull(),
  score: integer("score").notNull(),
  intentScore: integer("intent_score").notNull(),
  fitScore: integer("fit_score").notNull(),
  urgencyScore: integer("urgency_score").notNull(),
  specificityScore: integer("specificity_score").notNull(),
  replySafetyScore: integer("reply_safety_score").notNull(),
  confidence: integer("confidence_basis_points").notNull(),
  reason: text("reason").notNull(),
  signals: text("signals", { mode: "json" }).$type<string[]>().notNull(),
  risks: text("risks", { mode: "json" }).$type<string[]>().notNull(),
  replyDraft: text("reply_draft").notNull(),
  status: text("status", { enum: ["new", "sent", "saved", "dismissed", "replied"] }).notNull().default("new"),
  alertedAt: integer("alerted_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("opportunities_user_conversation_unique").on(table.userId, table.conversationId),
  index("opportunities_user_score_idx").on(table.userId, table.score),
]);

export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  opportunityId: text("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  value: text("value", { enum: ["good", "bad", "dismiss", "replied", "rewrite"] }).notNull(),
  note: text("note"),
  editedDraft: text("edited_draft"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("feedback_user_id_idx").on(table.userId)]);

export const monitorRuns = sqliteTable("monitor_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["running", "completed", "failed"] }).notNull(),
  sourcesChecked: integer("sources_checked").notNull().default(0),
  candidatesFound: integer("candidates_found").notNull().default(0),
  opportunitiesCreated: integer("opportunities_created").notNull().default(0),
  error: text("error"),
  startedAt: integer("started_at").notNull(),
  finishedAt: integer("finished_at"),
});

export const userDigests = sqliteTable("user_digests", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  opportunityId: text("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  sentAt: integer("sent_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.opportunityId] })]);
