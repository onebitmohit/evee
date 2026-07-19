import { defineTool } from "eve/tools";
import { z } from "zod";
import { getUnalertedOpportunities, getUser } from "../../src/db/repository";
import { monitorUser } from "../../src/services/monitor";

export default defineTool({
  description: "Scan configured public sources for a user, analyze new conversations, and return the strongest unsent opportunities.",
  inputSchema: z.object({ userId: z.string().uuid() }),
  async execute({ userId }) {
    const result = await monitorUser(userId);
    const user = await getUser(userId);
    const opportunities = await getUnalertedOpportunities(userId, user?.minScore ?? 65, 5);
    return { result, opportunities };
  },
});
