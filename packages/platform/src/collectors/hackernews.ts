import type { Candidate, Profile } from "../domain/types";
import { cleanText } from "../utils/text";
import { fetchJson, searchTerms } from "./shared";

interface HnHit {
  objectID?: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  comment_text?: string;
  author?: string;
  created_at_i?: number;
  points?: number;
  num_comments?: number;
}

export async function collectHackerNews(profile: Profile): Promise<Candidate[]> {
  const terms = searchTerms(profile).slice(0, 5);
  const batches = await Promise.all(terms.map(async (term) => {
    const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
    url.search = new URLSearchParams({ query: term, tags: "(story,comment)", hitsPerPage: "20" }).toString();
    return (await fetchJson<{ hits?: HnHit[] }>(url.toString())).hits ?? [];
  }));

  const seen = new Set<string>();
  return batches.flat().flatMap((hit) => {
    if (!hit.objectID || seen.has(hit.objectID)) return [];
    seen.add(hit.objectID);
    const title = hit.title ?? hit.story_title ?? cleanText(hit.comment_text ?? "", 160);
    if (!title) return [];
    return [{
      source: "hackernews" as const,
      externalId: hit.objectID,
      url: hit.url ?? hit.story_url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
      title: cleanText(title, 500),
      body: cleanText(hit.comment_text ?? ""),
      ...(hit.author ? { author: hit.author } : {}),
      ...(hit.created_at_i ? { publishedAt: hit.created_at_i * 1_000 } : {}),
      metadata: { points: hit.points, comments: hit.num_comments },
    }];
  });
}
