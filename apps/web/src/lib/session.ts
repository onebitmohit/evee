import { auth } from "@evee/auth";
import { ensureWorkspaceForAuthUser, getWorkspaceForAuthUser } from "@evee/platform/db/workspaces";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireWorkspace = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  let workspace = await getWorkspaceForAuthUser(session.user.id);
  if (!workspace) {
    await ensureWorkspaceForAuthUser({ id: session.user.id, name: session.user.name });
    workspace = await getWorkspaceForAuthUser(session.user.id);
  }
  if (!workspace) throw new Error("Could not initialize your workspace.");
  return { session, ...workspace };
});
