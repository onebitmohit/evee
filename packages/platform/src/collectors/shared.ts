import type { Profile } from "../domain/types";

export function searchTerms(profile: Profile) {
  const raw = [
    ...profile.keywords,
    ...profile.painPoints,
    ...profile.competitors,
    profile.productName,
  ];
  return [...new Set(raw.map((term) => term.trim()).filter((term) => term.length >= 3))].slice(0, 8);
}

export async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "application/json", ...init.headers },
  });
  if (!response.ok) throw new Error(`Source request failed (${response.status}) for ${new URL(url).hostname}`);
  return response.json() as Promise<T>;
}
