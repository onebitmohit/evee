import { auth } from "@evee/auth";
import { type AuthFn, localDev } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

function betterAuthSession(): AuthFn<Request> {
  return async (request) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return null;
    return {
      authenticator: "better-auth",
      principalId: session.user.id,
      principalType: "user",
      attributes: { email: session.user.email, name: session.user.name },
    };
  };
}

export default eveChannel({
  auth: process.env.NODE_ENV === "production"
    ? [betterAuthSession()]
    : [betterAuthSession(), localDev()],
});
