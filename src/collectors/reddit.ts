import { env } from "../config/env";
import type { Candidate, Profile } from "../domain/types";
import { cleanText } from "../utils/text";
import { fetchJson, searchTerms } from "./shared";

interface RedditResponse {
  data?: { children?: Array<{ data?: Record<string, unknown> }> };
}

export async function collectReddit(profile: Profile): Promise<Candidate[]> {
  const query = searchTerms(profile).slice(0, 5).map((term) => `"${term.replaceAll('"', "")}"`).join(" OR ");
  if (!query) return [];
  const url = new URL("https://www.reddit.com/search.json");
  url.search = new URLSearchParams({ q: query, sort: "new", t: "week", limit: "50", raw_json: "1", type: "link" }).toString();
  const result = await fetchJson<RedditResponse>(url.toString(), { headers: { "User-Agent": env.REDDIT_USER_AGENT } });

  return (result.data?.children ?? []).flatMap(({ data }) => {
    if (!data || typeof data.id !== "string" || typeof data.title !== "string" || typeof data.permalink !== "string") return [];
    const created = typeof data.created_utc === "number" ? data.created_utc * 1_000 : undefined;
    return [{
      source: "reddit" as const,
      externalId: data.id,
      url: `https://www.reddit.com${data.permalink}`,
      title: cleanText(data.title, 500),
      body: cleanText(typeof data.selftext === "string" ? data.selftext : ""),
      ...(typeof data.author === "string" ? { author: data.author } : {}),
      ...(created ? { publishedAt: created } : {}),
      metadata: {
        subreddit: data.subreddit,
        score: data.score,
        comments: data.num_comments,
      },
    }];
  });
}
