import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { validateSession } from "../utils/session.js";
import type { Variables } from "../types/hono.js";

// sits between request and the route

export async function authMiddleware(
  c: Context<{ Variables: Variables }>,
  next: Next
) {
  //1. reads out session_id from cookie
  const sessionId = getCookie(c, "session_id");

  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 2. checks if session is valid
  const session = await validateSession(sessionId);

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 3. Safes userId & sessionId in context, so routes can access them via 'c.get("userId")'
  c.set("userId", session.userId);
  c.set("sessionId", sessionId);

  await next();
}
