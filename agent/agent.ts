import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { defineAgent } from "eve";

const google = createGoogleGenerativeAI({ ...(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {}) });

export default defineAgent({
  model: google(process.env.GEMINI_MODEL ?? "gemini-2.5-flash"),
  reasoning: "low",
  limits: {
    maxOutputTokensPerSession: 24_000,
  },
});
