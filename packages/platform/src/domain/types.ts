import { z } from "zod";

export const sourceTypeSchema = z.enum(["reddit", "hackernews", "github", "rss"]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const profileInputSchema = z.object({
  productName: z.string().min(1),
  productUrl: z.string().url().optional(),
  productSummary: z.string().min(10),
  targetCustomers: z.array(z.string().min(1)).min(1),
  painPoints: z.array(z.string().min(1)).min(1),
  competitors: z.array(z.string().min(1)).default([]),
  replyStyle: z.string().min(3),
  keywords: z.array(z.string().min(1)).default([]),
  exclusions: z.array(z.string().min(1)).default([]),
});
export type ProfileInput = z.infer<typeof profileInputSchema>;

export interface Profile extends ProfileInput {
  id: string;
  userId: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export const candidateSchema = z.object({
  source: sourceTypeSchema,
  externalId: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1),
  body: z.string().default(""),
  author: z.string().optional(),
  publishedAt: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type Candidate = z.infer<typeof candidateSchema>;

export const opportunityAnalysisSchema = z.object({
  relevant: z.boolean(),
  score: z.number().int().min(0).max(100),
  intentScore: z.number().int().min(0).max(25),
  fitScore: z.number().int().min(0).max(25),
  urgencyScore: z.number().int().min(0).max(20),
  specificityScore: z.number().int().min(0).max(15),
  replySafetyScore: z.number().int().min(0).max(15),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1),
  signals: z.array(z.string()).max(6),
  risks: z.array(z.string()).max(5),
  replyDraft: z.string(),
});
export type OpportunityAnalysis = z.infer<typeof opportunityAnalysisSchema>;

export interface StoredOpportunity extends OpportunityAnalysis {
  id: string;
  userId: string;
  candidate: Candidate;
  status: "new" | "sent" | "saved" | "dismissed" | "replied";
  createdAt: number;
}

export const feedbackValueSchema = z.enum(["good", "bad", "dismiss", "replied", "rewrite"]);
export type FeedbackValue = z.infer<typeof feedbackValueSchema>;
