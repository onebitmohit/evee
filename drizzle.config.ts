import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/platform/src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: process.env.TURSO_AUTH_TOKEN
    ? { url: process.env.TURSO_DATABASE_URL ?? "file:local.db", authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: process.env.TURSO_DATABASE_URL ?? "file:local.db" },
});
