import { XMLParser } from "fast-xml-parser";
import type { Candidate } from "../domain/types";
import { cleanText } from "../utils/text";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function array<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function stringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return stringValue(record["#text"] ?? record["@_href"] ?? "");
  }
  return "";
}

export async function collectRss(feedUrl: string): Promise<Candidate[]> {
  const response = await fetch(feedUrl, { signal: AbortSignal.timeout(15_000), headers: { Accept: "application/rss+xml, application/atom+xml, text/xml" } });
  if (!response.ok) throw new Error(`RSS request failed (${response.status}) for ${new URL(feedUrl).hostname}`);
  const parsed = parser.parse(await response.text()) as Record<string, any>;
  const items: Array<Record<string, unknown>> = parsed.rss?.channel?.item
    ? array(parsed.rss.channel.item)
    : array(parsed.feed?.entry);

  return items.slice(0, 50).flatMap((item) => {
    const url = stringValue(item.link) || stringValue(item.guid) || stringValue(item.id);
    const title = cleanText(stringValue(item.title), 500);
    if (!url || !title) return [];
    const published = stringValue(item.pubDate ?? item.published ?? item.updated);
    const timestamp = published ? new Date(published).getTime() : undefined;
    return [{
      source: "rss" as const,
      externalId: stringValue(item.guid ?? item.id) || url,
      url,
      title,
      body: cleanText(stringValue(item.description ?? item.summary ?? item.content)),
      ...(stringValue(item.author) ? { author: stringValue(item.author) } : {}),
      ...(timestamp && !Number.isNaN(timestamp) ? { publishedAt: timestamp } : {}),
      metadata: { feedUrl },
    }];
  });
}
