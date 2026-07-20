"use server";

import { updateUserPreferences } from "@evee/platform/db/repository";
import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/session";

export async function saveSettings(formData: FormData) {
  const { runtimeUser } = await requireWorkspace();
  const digestHour = Number(formData.get("digestHour"));
  const minScore = Number(formData.get("minScore"));
  const timezone = String(formData.get("timezone") ?? "UTC");
  if (!Number.isInteger(digestHour) || digestHour < 0 || digestHour > 23) throw new Error("Digest hour must be between 0 and 23.");
  if (!Number.isInteger(minScore) || minScore < 40 || minScore > 100) throw new Error("Minimum score must be between 40 and 100.");
  new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
  await updateUserPreferences(runtimeUser.id, { digestHour, minScore, timezone, alertsEnabled: formData.get("alertsEnabled") === "on" });
  revalidatePath("/dashboard/settings");
}
