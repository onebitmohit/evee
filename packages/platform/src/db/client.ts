import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "node:path";
import { env } from "../config/env";
import * as schema from "./schema";

const databaseUrl = (() => {
  if (!env.TURSO_DATABASE_URL.startsWith("file:")) return env.TURSO_DATABASE_URL;
  const filePath = env.TURSO_DATABASE_URL.slice("file:".length);
  if (path.isAbsolute(filePath)) return env.TURSO_DATABASE_URL;
  const cwd = process.cwd();
  const parentName = path.basename(path.dirname(cwd));
  const monorepoRoot = parentName === "apps" || parentName === "packages" ? path.resolve(cwd, "../..") : cwd;
  return `file:${path.resolve(env.EVEE_REPO_ROOT ?? monorepoRoot, filePath)}`;
})();

export const client = createClient({
  url: databaseUrl,
  ...(env.TURSO_AUTH_TOKEN ? { authToken: env.TURSO_AUTH_TOKEN } : {}),
});

export const db = drizzle(client, { schema });
