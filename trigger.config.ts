import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_replace_me",
  dirs: ["./trigger"],
  maxDuration: 900,
  retries: {
    enabledInDev: true,
    default: { maxAttempts: 3, minTimeoutInMs: 1_000, maxTimeoutInMs: 30_000, factor: 2, randomize: true },
  },
});
