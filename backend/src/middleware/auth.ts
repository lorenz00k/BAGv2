import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { validateSession } from "../utils/session.js";
import type { Variables } from "../types/hono.js"; 


//WAS MACHT DER BUMMS:
// Liest session_id Cookie
// Validiert Session
// Setzt userId in Context (für Routes zugänglich)
// Blockiert Request wenn keine valide Session

export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next)  {
  const sessionId = getCookie(c, "session_id");
  
  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const session = await validateSession(sessionId);
  
  if (!session) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }
  
  // Session in Context speichern für spätere Nutzung
  c.set("userId", session.userId);
  c.set("sessionId", sessionId);
  
  await next();
}