import type { NextConfig } from "next";
import { withEve } from "eve/next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
loadEnvConfig(repoRoot);
process.env.EVEE_REPO_ROOT ??= repoRoot;

const nextConfig: NextConfig = {
  transpilePackages: ["@evee/auth", "@evee/platform"],
  outputFileTracingRoot: repoRoot,
  turbopack: { root: repoRoot },
};

export default withEve(nextConfig, {
  eveRoot: "../..",
});
