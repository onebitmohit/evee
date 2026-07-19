import type { Candidate, Profile } from "../domain/types";
import type { SourceRow } from "../db/repository";
import { collectGithub } from "./github";
import { collectHackerNews } from "./hackernews";
import { collectReddit } from "./reddit";
import { collectRss } from "./rss";

export async function collectSource(source: SourceRow, profile: Profile): Promise<Candidate[]> {
  switch (source.type) {
    case "reddit": return collectReddit(profile);
    case "hackernews": return collectHackerNews(profile);
    case "github": return collectGithub(profile);
    case "rss": {
      const url = source.config.url;
      if (typeof url !== "string") throw new Error(`RSS source ${source.id} has no URL`);
      return collectRss(url);
    }
  }
}
