import { and, desc, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { env } from "../config/env";
import { db } from "./client";
import {
  agentConfigs,
  feedback,
  integrations,
  monitorRuns,
  opportunities,
  profiles,
  sources,
  subscriptions,
  telegramConnections,
  telegramLinkCodes,
  userDigests,
  users,
  workspaceMembers,
  workspaces,
} from "./schema";

const now = () => Date.now();
const id = () => crypto.randomUUID();

function slugify(value: string) {
  const base = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace";
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function ensureWorkspaceForAuthUser(authUser: { id: string; name: string }) {
  const membership = await db.select({ workspace: workspaces, runtimeUser: users })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .leftJoin(users, eq(users.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, authUser.id))
    .limit(1);
  if (membership[0]?.runtimeUser) return membership[0];

  const timestamp = now();
  const workspaceId = membership[0]?.workspace.id ?? id();
  if (!membership[0]) {
    await db.insert(workspaces).values({
      id: workspaceId,
      name: `${authUser.name}'s workspace`,
      slug: slugify(authUser.name),
      ownerId: authUser.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await db.insert(workspaceMembers).values({ workspaceId, userId: authUser.id, role: "owner", createdAt: timestamp });
  }

  const runtimeUserId = id();
  await db.insert(users).values({
    id: runtimeUserId,
    workspaceId,
    authUserId: authUser.id,
    telegramUserId: `web:${authUser.id}`,
    telegramChatId: `web:${authUser.id}`,
    firstName: authUser.name,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(subscriptions).values({
    id: id(), workspaceId, status: "trialing", plan: "starter", createdAt: timestamp, updatedAt: timestamp,
  }).onConflictDoNothing();

  const integrationTypes = ["reddit", "github", "hackernews", "rss", "telegram", "slack", "email", "x"] as const;
  await db.insert(integrations).values(integrationTypes.map((type) => ({
    id: id(),
    workspaceId,
    type,
    displayName: type === "hackernews" ? "Hacker News" : type === "x" ? "X" : `${type[0]!.toUpperCase()}${type.slice(1)}`,
    status: (["reddit", "github", "hackernews", "rss"] as const).includes(type as "reddit") ? "connected" as const : "disconnected" as const,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))).onConflictDoNothing();

  await db.insert(agentConfigs).values({
    id: id(), workspaceId, name: "GTM Copilot", description: "Researches demand, prioritizes opportunities, and drafts useful replies.",
    instructions: "Use the workspace profile and feedback. Prefer explicit need, explain evidence, and never post without approval.",
    createdAt: timestamp, updatedAt: timestamp,
  });

  return getWorkspaceForAuthUser(authUser.id);
}

export async function getWorkspaceForAuthUser(authUserId: string) {
  const rows = await db.select({ workspace: workspaces, runtimeUser: users, role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .innerJoin(users, eq(users.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, authUserId))
    .limit(1);
  return rows[0];
}

export async function getWorkspaceDashboard(runtimeUserId: string) {
  const since = now() - 7 * 24 * 60 * 60 * 1_000;
  const [opportunityRows, monitorRows, recentRuns] = await Promise.all([
    db.select({
      total: sql<number>`count(*)`,
      averageScore: sql<number>`coalesce(avg(${opportunities.score}), 0)`,
      replied: sql<number>`sum(case when ${opportunities.status} = 'replied' then 1 else 0 end)`,
    }).from(opportunities).where(and(eq(opportunities.userId, runtimeUserId), gt(opportunities.createdAt, since))),
    db.select({ active: sql<number>`count(*)` }).from(sources)
      .where(and(eq(sources.userId, runtimeUserId), eq(sources.enabled, true))),
    db.select().from(monitorRuns).where(eq(monitorRuns.userId, runtimeUserId))
      .orderBy(desc(monitorRuns.startedAt)).limit(6),
  ]);
  const opportunityStats = opportunityRows[0];
  const monitorStats = monitorRows[0];
  return {
    opportunities: Number(opportunityStats?.total ?? 0),
    averageScore: Math.round(Number(opportunityStats?.averageScore ?? 0)),
    replied: Number(opportunityStats?.replied ?? 0),
    activeMonitors: Number(monitorStats?.active ?? 0),
    recentRuns,
  };
}

export async function listWorkspaceIntegrations(workspaceId: string) {
  return db.select().from(integrations).where(eq(integrations.workspaceId, workspaceId));
}

export async function listWorkspaceAgents(workspaceId: string) {
  return db.select().from(agentConfigs).where(eq(agentConfigs.workspaceId, workspaceId));
}

export async function getWorkspaceSubscription(workspaceId: string) {
  return db.query.subscriptions.findFirst({ where: eq(subscriptions.workspaceId, workspaceId) });
}

export async function getTelegramConnection(workspaceId: string) {
  return db.query.telegramConnections.findFirst({ where: eq(telegramConnections.workspaceId, workspaceId) });
}

const linkAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function linkSecret() {
  const secret = env.TELEGRAM_LINK_SECRET ?? env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 24) throw new Error("TELEGRAM_LINK_SECRET must be at least 24 characters.");
  return secret;
}

async function hashLinkCode(code: string) {
  const bytes = new TextEncoder().encode(`${linkSecret()}:${code.trim().toUpperCase()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createTelegramLinkCode(workspaceId: string, authUserId: string) {
  const timestamp = now();
  await db.update(telegramLinkCodes).set({ consumedAt: timestamp })
    .where(and(eq(telegramLinkCodes.workspaceId, workspaceId), isNull(telegramLinkCodes.consumedAt)));
  const random = crypto.getRandomValues(new Uint8Array(8));
  const code = Array.from(random, (value) => linkAlphabet[value % linkAlphabet.length]!).join("");
  const expiresAt = timestamp + 10 * 60 * 1_000;
  await db.insert(telegramLinkCodes).values({
    id: id(), workspaceId, authUserId, codeHash: await hashLinkCode(code), expiresAt, createdAt: timestamp,
  });
  return { code, expiresAt };
}

export async function consumeTelegramLinkCode(input: {
  code: string;
  telegramUserId: string;
  telegramChatId: string;
  telegramUsername?: string;
  firstName?: string;
}) {
  const codeHash = await hashLinkCode(input.code);
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(telegramLinkCodes)
      .where(and(eq(telegramLinkCodes.codeHash, codeHash), isNull(telegramLinkCodes.consumedAt)))
      .limit(1);
    const link = rows[0];
    if (!link || link.expiresAt <= now()) throw new Error("That link code is invalid or expired.");

    const existing = await tx.select().from(telegramConnections)
      .where(eq(telegramConnections.telegramUserId, input.telegramUserId)).limit(1);
    if (existing[0] && existing[0].workspaceId !== link.workspaceId) {
      throw new Error("This Telegram account is already linked to another workspace.");
    }

    const runtime = await tx.select().from(users).where(eq(users.workspaceId, link.workspaceId)).limit(1);
    const runtimeUser = runtime[0];
    if (!runtimeUser) throw new Error("The workspace is not ready yet.");
    const telegramUser = (await tx.select().from(users)
      .where(eq(users.telegramUserId, input.telegramUserId)).limit(1))[0];
    if (telegramUser?.workspaceId && telegramUser.workspaceId !== link.workspaceId) {
      throw new Error("This Telegram account is already linked to another workspace.");
    }

    if (telegramUser && telegramUser.id !== runtimeUser.id) {
      const [runtimeProfile, telegramProfile] = await Promise.all([
        tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, runtimeUser.id)).limit(1),
        tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, telegramUser.id)).limit(1),
      ]);
      if (telegramProfile[0]) {
        if (runtimeProfile[0]) await tx.delete(profiles).where(eq(profiles.id, telegramProfile[0].id));
        else await tx.update(profiles).set({ userId: runtimeUser.id }).where(eq(profiles.id, telegramProfile[0].id));
      }

      const runtimeConversationIds = new Set((await tx.select({ conversationId: opportunities.conversationId })
        .from(opportunities).where(eq(opportunities.userId, runtimeUser.id))).map((row) => row.conversationId));
      const duplicateOpportunityIds = (await tx.select({ id: opportunities.id, conversationId: opportunities.conversationId })
        .from(opportunities).where(eq(opportunities.userId, telegramUser.id)))
        .filter((row) => runtimeConversationIds.has(row.conversationId)).map((row) => row.id);
      if (duplicateOpportunityIds.length) {
        await tx.delete(opportunities).where(inArray(opportunities.id, duplicateOpportunityIds));
      }

      await tx.update(sources).set({ userId: runtimeUser.id }).where(eq(sources.userId, telegramUser.id));
      await tx.update(opportunities).set({ userId: runtimeUser.id }).where(eq(opportunities.userId, telegramUser.id));
      await tx.update(feedback).set({ userId: runtimeUser.id }).where(eq(feedback.userId, telegramUser.id));
      await tx.update(monitorRuns).set({ userId: runtimeUser.id }).where(eq(monitorRuns.userId, telegramUser.id));
      await tx.update(userDigests).set({ userId: runtimeUser.id }).where(eq(userDigests.userId, telegramUser.id));
      await tx.delete(users).where(eq(users.id, telegramUser.id));
    }

    const timestamp = now();
    const claimed = await tx.update(telegramLinkCodes).set({ consumedAt: timestamp })
      .where(and(eq(telegramLinkCodes.id, link.id), isNull(telegramLinkCodes.consumedAt)));
    if (claimed.rowsAffected !== 1) throw new Error("That link code has already been used.");

    await tx.update(users).set({
      telegramUserId: input.telegramUserId,
      telegramChatId: input.telegramChatId,
      firstName: input.firstName ?? runtimeUser.firstName,
      username: input.telegramUsername ?? runtimeUser.username,
      updatedAt: timestamp,
    }).where(eq(users.id, runtimeUser.id));

    await tx.insert(telegramConnections).values({
      id: existing[0]?.id ?? id(),
      workspaceId: link.workspaceId,
      userId: runtimeUser.id,
      authUserId: link.authUserId,
      telegramUserId: input.telegramUserId,
      telegramChatId: input.telegramChatId,
      telegramUsername: input.telegramUsername,
      firstName: input.firstName,
      linkedAt: existing[0]?.linkedAt ?? timestamp,
      updatedAt: timestamp,
    }).onConflictDoUpdate({
      target: telegramConnections.workspaceId,
      set: {
        telegramUserId: input.telegramUserId,
        telegramChatId: input.telegramChatId,
        telegramUsername: input.telegramUsername,
        firstName: input.firstName,
        updatedAt: timestamp,
      },
    });
    await tx.update(integrations).set({ status: "connected", externalAccountId: input.telegramUserId, updatedAt: timestamp })
      .where(and(eq(integrations.workspaceId, link.workspaceId), eq(integrations.type, "telegram")));
    return { workspaceId: link.workspaceId, userId: runtimeUser.id };
  });
}
