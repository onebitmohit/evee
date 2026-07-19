import { defineTool } from "eve/tools";
import { z } from "zod";
import { getProfile } from "../../src/db/repository";

export default defineTool({
  description: "Read a user's saved product, audience, pain points, competitors, keywords, exclusions, and preferred reply style.",
  inputSchema: z.object({ userId: z.string().uuid() }),
  async execute({ userId }) {
    const profile = await getProfile(userId);
    return profile ?? { error: "No saved product profile." };
  },
});
