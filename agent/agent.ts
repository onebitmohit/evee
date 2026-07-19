import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.EVE_MODEL ?? "google/gemini-2.5-flash",
});
