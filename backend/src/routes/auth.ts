import { Hono } from "hono";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { registerSchema, loginSchema } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { createSession } from "../utils/session.js";
import { deleteCookie } from "hono/cookie";
import { deleteSession } from "../utils/session.js";
import { authMiddleware } from "../middleware/auth.js";
import type { Variables } from "../types/hono.js"; 
import { loginRateLimiter, registerRateLimiter } from "../middleware/rate-limit.js";


const auth = new Hono<{ Variables: Variables }>();

// POST /api/auth/register
auth.post("/register", registerRateLimiter ,async (c) => {
  try {
    const body = await c.req.json();
    const data = registerSchema.parse(body);

    // Check if email exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Email already exists" }, 400);
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

    return c.json({ user: newUser }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/auth/login (ERSETZEN)
auth.post("/login", loginRateLimiter , async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const valid = await verifyPassword(user.passwordHash, data.password);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Session erstellen
    const sessionId = await createSession(user.id);
    
    // Cookie setzen
    setCookie(c, "session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60, // 30 Tage
      path: "/",
    });

    return c.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/auth/logout
auth.post("/logout", authMiddleware, async (c) => {
  const sessionId = c.get("sessionId");
  
  await deleteSession(sessionId);
  deleteCookie(c, "session_id", {
    path: "/",
  });
  
  return c.json({ message: "Logged out" });
});

export default auth;