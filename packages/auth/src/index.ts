import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@evee/platform/db/client";
import {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
} from "@evee/platform/db/schema";
import { ensureWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { betterAuth } from "better-auth";

const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? "evee-local-development-secret-not-for-production"
    : undefined);

export const auth = betterAuth({
  appName: "Evee",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  ...(authSecret ? { secret: authSecret } : {}),
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await ensureWorkspaceForAuthUser({ id: user.id, name: user.name });
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
