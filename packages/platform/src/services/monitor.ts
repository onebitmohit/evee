import { analyzeOpportunity, candidatePrefilter } from "../ai/analyzer";
import { collectSource } from "../collectors";
import {
  beginMonitorRun,
  finishMonitorRun,
  getEnabledSources,
  getProfile,
  getRecentFeedback,
  hasOpportunity,
  markSourceChecked,
  storeCandidate,
  storeOpportunity,
} from "../db/repository";

export interface MonitorResult {
  sourcesChecked: number;
  candidatesFound: number;
  opportunitiesCreated: number;
  errors: string[];
}

function excluded(text: string, exclusions: string[]) {
  const lower = text.toLowerCase();
  return exclusions.some((term) => lower.includes(term.toLowerCase()));
}

export async function monitorUser(userId: string): Promise<MonitorResult> {
  const profile = await getProfile(userId);
  if (!profile) throw new Error("Complete onboarding before monitoring opportunities.");
  const sourceRows = await getEnabledSources(userId);
  const feedback = await getRecentFeedback(userId);
  const runId = await beginMonitorRun(userId);
  const result: MonitorResult = { sourcesChecked: 0, candidatesFound: 0, opportunitiesCreated: 0, errors: [] };

  try {
    const collected = await Promise.all(sourceRows.map(async (source) => {
      try {
        const candidates = await collectSource(source, profile);
        result.sourcesChecked += 1;
        result.candidatesFound += candidates.length;
        await markSourceChecked(source.id);
        return candidates;
      } catch (error) {
        const message = `${source.name}: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(message);
        return [];
      }
    }));

    const unique = new Map(collected.flat().map((candidate) => [`${candidate.source}:${candidate.externalId}`, candidate]));
    const ranked = [...unique.values()]
      .filter((candidate) => !excluded(`${candidate.title} ${candidate.body}`, profile.exclusions))
      .map((candidate) => ({ candidate, prefilter: candidatePrefilter(candidate, profile) }))
      .filter(({ prefilter }) => prefilter > 0)
      .sort((a, b) => b.prefilter - a.prefilter)
      .slice(0, 40);

    for (const { candidate } of ranked) {
      const stored = await storeCandidate(candidate);
      if (await hasOpportunity(userId, stored.id)) continue;
      const analysis = await analyzeOpportunity(candidate, profile, feedback);
      await storeOpportunity(userId, stored.id, analysis);
      if (analysis.relevant) result.opportunitiesCreated += 1;
    }
    await finishMonitorRun(runId, result);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await finishMonitorRun(runId, { ...result, error: message });
    throw error;
  }
}
