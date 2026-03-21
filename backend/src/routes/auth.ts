import { Hono } from "hono";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { registerSchema, loginSchema } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createSession } from "../utils/session.js";
import { deleteCookie } from "hono/cookie";
import { deleteSession } from "../utils/session.js";
import { authMiddleware } from "../middleware/auth.js";
import type { Variables } from "../types/hono.js";
import { loginRateLimiter, registerRateLimiter } from "../middleware/rate-limit.js";
import { HTTPException } from "hono/http-exception";
import { clearSidCookie, readSid } from "../utils/checkerSession.js";
import { mergeAnonymousChecker } from "../utils/sessionMerge.js";


const auth = new Hono<{ Variables: Variables }>();

// POST /api/auth/register
auth.post("/register", registerRateLimiter, async (c) => {
  const body = await c.req.json();
  const data = registerSchema.parse(body);

  // Check if email exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    throw new HTTPException(400, { message: "Email already exists" });
  }

  // Hash password & create user
  const passwordHash = await hashPassword(data.password);
  const [newUser] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
    })
    .returning({ id: users.id, email: users.email });

  if (!newUser) {
    throw new HTTPException(500, { message: "User creation failed" });
  }
  // direkt einloggen:
  const sessionId = await createSession(newUser.id);
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  // Anonyme Checker-Session migrieren
  const sid = readSid(c);
  await mergeAnonymousChecker(sid, newUser.id);
  clearSidCookie(c);

  return c.json({ user: newUser }, 201);
});

// POST /api/auth/login (ERSETZEN)
auth.post("/login", loginRateLimiter, async (c) => {
  const body = await c.req.json();
  const data = loginSchema.parse(body);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (!user) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const valid = await verifyPassword(user.passwordHash, data.password);
  if (!valid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  // Session erstellen
  const sessionId = await createSession(user.id);

  // Cookie setzen
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60, // 30 Tage
    path: "/",
  });

  //session merge: get anonymous data 
  const sid = readSid(c)
  await mergeAnonymousChecker(sid, user.id);
  clearSidCookie(c);

  return c.json({
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

// POST /api/auth/logout
auth.post("/logout", async (c) => {
  const sessionId = getCookie(c, "session_id")
  if (sessionId) {
    await deleteSession(sessionId).catch(() => { });
  }

  deleteCookie(c, "session_id", {
    path: "/",
  });
  //damit daten nach logout nicht mehr angezeigt werden
  clearSidCookie(c);

  return c.json({ message: "Logged out" });
});

// GET /api/auth/me — aktuelle Session prüfen
auth.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return c.json({ user });
});

export default auth;