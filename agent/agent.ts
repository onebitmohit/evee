import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AI_MODEL ?? "google/gemini-3.5-flash",
});
