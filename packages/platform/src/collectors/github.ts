import { env } from "../config/env";
import type { Candidate, Profile } from "../domain/types";
import { cleanText } from "../utils/text";
import { fetchJson, searchTerms } from "./shared";

interface GithubItem {
  id: number;
  html_url: string;
  title: string;
  body?: string | null;
  user?: { login?: string } | null;
  created_at?: string;
  state?: string;
  comments?: number;
  repository_url?: string;
}

export async function collectGithub(profile: Profile): Promise<Candidate[]> {
  const terms = searchTerms(profile).slice(0, 4);
  if (!terms.length) return [];
  const query = terms.map((term) => `"${term.replaceAll('"', "")}"`).join(" OR ");
  const url = new URL("https://api.github.com/search/issues");
  url.search = new URLSearchParams({ q: `${query} is:open`, sort: "created", order: "desc", per_page: "50" }).toString();
  const headers: Record<string, string> = {
    "User-Agent": "evee-opportunity-monitor",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  const result = await fetchJson<{ items?: GithubItem[] }>(url.toString(), { headers });
  return (result.items ?? []).map((item) => ({
    source: "github",
    externalId: String(item.id),
    url: item.html_url,
    title: cleanText(item.title, 500),
    body: cleanText(item.body ?? ""),
    ...(item.user?.login ? { author: item.user.login } : {}),
    ...(item.created_at ? { publishedAt: new Date(item.created_at).getTime() } : {}),
    metadata: { state: item.state, comments: item.comments, repositoryUrl: item.repository_url },
  }));
}
