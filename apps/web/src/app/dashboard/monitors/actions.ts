"use server";

import { createMonitor, setMonitorEnabled } from "@evee/platform/db/repository";
import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/session";

export async function addMonitor(formData: FormData) {
  const { runtimeUser } = await requireWorkspace();
  const type = String(formData.get("type"));
  if (!(["reddit", "hackernews", "github", "rss"] as string[]).includes(type)) throw new Error("Unsupported monitor source.");
  const query = String(formData.get("query") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name || !query) throw new Error("Monitor name and query are required.");
  await createMonitor({ userId: runtimeUser.id, type: type as "reddit" | "hackernews" | "github" | "rss", name, config: type === "rss" ? { url: query } : { query } });
  revalidatePath("/dashboard/monitors");
}

export async function toggleMonitor(formData: FormData) {
  const { runtimeUser } = await requireWorkspace();
  await setMonitorEnabled(runtimeUser.id, String(formData.get("sourceId")), String(formData.get("enabled")) === "true");
  revalidatePath("/dashboard/monitors");
}
